package expo.modules.autodialer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Data
import java.util.concurrent.TimeUnit
import android.util.Log
import java.net.HttpURLConnection
import java.net.URL

class CallBroadcastReceiver : BroadcastReceiver() {
    companion object {
        private var lastDialedNumber: String? = null
        private var callStartTime: Long = 0
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_NEW_OUTGOING_CALL) {
            val rawNumber = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER) ?: ""
            val digitsOnly = rawNumber.replace(Regex("\\D"), "")
            lastDialedNumber = if (digitsOnly.length > 10) digitsOnly.takeLast(10) else digitsOnly

            callStartTime = System.currentTimeMillis()
            Log.d("CallBroadcastReceiver", "Outgoing call detected to: $lastDialedNumber (raw: $rawNumber) at $callStartTime")
        } else if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            if (state == TelephonyManager.EXTRA_STATE_RINGING) {
                // INCOMING CALL DETECTED
                if (!incomingNumber.isNullOrEmpty()) {
                    val digitsOnly = incomingNumber.replace(Regex("\\D"), "")
                    lastDialedNumber = if (digitsOnly.length > 10) digitsOnly.takeLast(10) else digitsOnly
                    Log.d("CallBroadcastReceiver", "Incoming call ringing from: $lastDialedNumber")
                }
            } else if (state == TelephonyManager.EXTRA_STATE_OFFHOOK) {
                // Call answered (outgoing dialled or incoming picked up)
                if (callStartTime == 0L) {
                    callStartTime = System.currentTimeMillis()
                }
                // ── Notify backend: employee is now ON a call ──
                postCallStatus(context, isOnCall = true)
            } else if (state == TelephonyManager.EXTRA_STATE_IDLE) {
                // Call ended
                // ── Notify backend: employee is no longer on a call ──
                if (callStartTime > 0L || lastDialedNumber != null) {
                    postCallStatus(context, isOnCall = false)
                }

                if (lastDialedNumber != null) {
                    val callEndTime = System.currentTimeMillis()
                    Log.d("CallBroadcastReceiver", "Call ended. Scheduling upload worker.")

                    val inputData = Data.Builder()
                        .putString("phoneNumber", lastDialedNumber)
                        .putLong("startTime", if (callStartTime > 0) callStartTime else (callEndTime - 1000))
                        .putLong("endTime", callEndTime)
                        .build()

                    val uploadWorkRequest = OneTimeWorkRequestBuilder<CallUploadWorker>()
                        .setInitialDelay(5, TimeUnit.SECONDS) // Wait for ODialer to save file
                        .setInputData(inputData)
                        .build()

                    WorkManager.getInstance(context).enqueue(uploadWorkRequest)

                    // Reset
                    lastDialedNumber = null
                    callStartTime = 0
                }
            }
        }
    }

    /**
     * Posts { isOnCall: true/false } to /api/call-status on a background thread.
     * Reads auth token and API URL from AutoDialerPrefs (written by setAuthTokenForBackground).
     * Uses plain HttpURLConnection — no OkHttp/Coroutines dependency needed.
     * This executes even when the React Native JS thread is suspended (app backgrounded).
     */
    private fun postCallStatus(context: Context, isOnCall: Boolean) {
        val prefs = context.getSharedPreferences("AutoDialerPrefs", Context.MODE_PRIVATE)
        val authToken = prefs.getString("auth_token", null)
        val apiUrl = prefs.getString("api_url", null)

        if (authToken == null || apiUrl == null) {
            Log.w("CallBroadcastReceiver", "postCallStatus skipped — auth_token or api_url missing in prefs")
            return
        }

        // BroadcastReceivers must not do network on the main thread
        Thread {
            try {
                val url = URL("$apiUrl/api/call-status")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Authorization", "Bearer $authToken")
                connection.setRequestProperty("Cookie", "better-auth.session_token=$authToken")
                connection.doOutput = true
                connection.connectTimeout = 5000
                connection.readTimeout = 5000

                val body = """{"isOnCall":$isOnCall}"""
                connection.outputStream.use { it.write(body.toByteArray()) }

                val responseCode = connection.responseCode
                Log.d("CallBroadcastReceiver", "postCallStatus isOnCall=$isOnCall → HTTP $responseCode")
                connection.disconnect()
            } catch (e: Exception) {
                Log.e("CallBroadcastReceiver", "postCallStatus failed: ${e.message}")
            }
        }.start()
    }
}
