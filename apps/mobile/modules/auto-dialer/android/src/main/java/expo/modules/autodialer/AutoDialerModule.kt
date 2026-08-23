package expo.modules.autodialer

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AutoDialerModule : Module() {
  private var isCallActive = false
  private var phoneStateListener: PhoneStateListener? = null

  override fun definition() = ModuleDefinition {
    Name("AutoDialer")

    Events("onCallEnded", "onCallStarted")

    Function("startListening") {
      val context = appContext.reactContext ?: throw Exception("React context not found")
      val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
      
      if (phoneStateListener == null) {
        phoneStateListener = object : PhoneStateListener() {
          override fun onCallStateChanged(state: Int, phoneNumber: String?) {
            when (state) {
              TelephonyManager.CALL_STATE_OFFHOOK -> {
                isCallActive = true
                sendEvent("onCallStarted", emptyMap<String, Any>())
              }
              TelephonyManager.CALL_STATE_IDLE -> {
                if (isCallActive) {
                  isCallActive = false
                  sendEvent("onCallEnded", emptyMap<String, Any>())
                }
              }
            }
          }
        }
      }

      try {
        telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE)
      } catch (e: SecurityException) {
        // Permission denied, handle gracefully
      }
    }

    Function("stopListening") {
      val context = appContext.reactContext ?: throw Exception("React context not found")
      val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
      phoneStateListener?.let {
        telephonyManager.listen(it, PhoneStateListener.LISTEN_NONE)
      }
    }

    Function("dialNumber") { phoneNumber: String ->
      val context = appContext.reactContext ?: throw Exception("React context not found")
      val intent = Intent(Intent.ACTION_CALL).apply {
        data = Uri.parse("tel:$phoneNumber")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      try {
        context.startActivity(intent)
      } catch (e: SecurityException) {
        throw Exception("Missing CALL_PHONE permission")
      }
    }

    Function("setODialerFolder") { folderUriString: String ->
      val context = appContext.reactContext ?: throw Exception("React context not found")
      val folderUri = Uri.parse(folderUriString)
      
      // Save the folder URI first so the worker can at least attempt to read it
      val prefs = context.getSharedPreferences("AutoDialerPrefs", Context.MODE_PRIVATE)
      prefs.edit().putString("odialer_folder_uri", folderUriString).apply()

      try {
        context.contentResolver.takePersistableUriPermission(folderUri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
      } catch (e: Exception) {
        // In Android 11+, some folders block persistable grants.
        // We catch this gracefully without throwing, since we already saved it!
        println("Warning: Could not take persistable permission: ${e.message}")
      }
    }

    Function("setAuthTokenForBackground") { token: String, apiUrl: String ->
      val context = appContext.reactContext ?: throw Exception("React context not found")
      val prefs = context.getSharedPreferences("AutoDialerPrefs", Context.MODE_PRIVATE)
      prefs.edit()
        .putString("auth_token", token)
        .putString("api_url", apiUrl)
        .apply()
    }
  }
}
