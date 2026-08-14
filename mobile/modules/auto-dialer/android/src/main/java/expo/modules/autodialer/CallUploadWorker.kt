package expo.modules.autodialer

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import java.io.DataOutputStream
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class CallUploadWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        Log.d("CallUploadWorker", "Worker started! Waking up...")
        
        val phoneNumber = inputData.getString("phoneNumber")
        val startTime = inputData.getLong("startTime", 0)
        val endTime = inputData.getLong("endTime", 0)
        
        Log.d("CallUploadWorker", "Inputs - Phone: $phoneNumber, Start: $startTime, End: $endTime")
        if (phoneNumber == null) return Result.failure()

        val prefs = applicationContext.getSharedPreferences("AutoDialerPrefs", Context.MODE_PRIVATE)
        
        val folderUriString = prefs.getString("odialer_folder_uri", null)
        Log.d("CallUploadWorker", "Folder URI String: ${folderUriString ?: "NULL"}")
        if (folderUriString == null) return Result.failure()
        
        val authToken = prefs.getString("auth_token", null)
        Log.d("CallUploadWorker", "Auth Token: ${if (authToken != null) "PRESENT (Length: ${authToken.length})" else "NULL"}")
        if (authToken == null) return Result.failure()
        
        val apiUrl = prefs.getString("api_url", null)
        Log.d("CallUploadWorker", "API URL: ${apiUrl ?: "NULL"}")
        if (apiUrl == null) return Result.failure()

        Log.d("CallUploadWorker", "All checks passed. Looking for recording for $phoneNumber between $startTime and $endTime")

        try {
            val folderUri = Uri.parse(folderUriString)
            val documentTree = DocumentFile.fromTreeUri(applicationContext, folderUri) ?: return Result.failure()

            // Find all files and filter by our time window. Give a 15-second grace period for ODialer saving
            var targetFile: DocumentFile? = null
            for (file in documentTree.listFiles()) {
                if (file.isFile && file.name?.endsWith(".mp3") == true) {
                    val lastModified = file.lastModified()
                    // If the file was modified exactly during our call, or up to 15 seconds after it ended
                    if (lastModified >= startTime && lastModified <= (endTime + 15000)) {
                        targetFile = file
                        break
                    }
                }
            }

            if (targetFile == null) {
                Log.e("CallUploadWorker", "No recording found for this timeframe.")
                return Result.failure()
            }

            Log.d("CallUploadWorker", "Found recording: ${targetFile.name}")

            // Upload the file to our backend
            val success = uploadFile(targetFile, phoneNumber, startTime, endTime, authToken, apiUrl)
            
            if (success) {
                // Optionally move it to a "Synced" folder so we know it's done
                // For now, just return success
                return Result.success()
            }
            return Result.retry()

        } catch (e: Exception) {
            Log.e("CallUploadWorker", "Error uploading call record: ${e.message}")
            return Result.retry()
        }
    }

    private fun uploadFile(
        file: DocumentFile,
        phoneNumber: String,
        startTime: Long,
        endTime: Long,
        authToken: String,
        apiUrl: String
    ): Boolean {
        val boundary = "Boundary-" + UUID.randomUUID().toString()
        val url = URL("$apiUrl/api/leads/upload-call-record")
        val connection = url.openConnection() as HttpURLConnection

        try {
            connection.doOutput = true
            connection.requestMethod = "POST"
            connection.setRequestProperty("Authorization", "Bearer $authToken")
            connection.setRequestProperty("Cookie", "better-auth.session_token=$authToken")
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")

            val outputStream = DataOutputStream(connection.outputStream)
            
            // Add fields
            writeFormField(outputStream, boundary, "phoneNumber", phoneNumber)
            writeFormField(outputStream, boundary, "startedAt", startTime.toString())
            writeFormField(outputStream, boundary, "endedAt", endTime.toString())

            // Add File
            Log.d("CallUploadWorker", "--- USING NEW APK WITH RECORDING.MP3 ---")
            outputStream.writeBytes("--$boundary\r\n")
            outputStream.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"recording.mp3\"\r\n")
            outputStream.writeBytes("Content-Type: audio/mpeg\r\n\r\n")

            val inputStream = applicationContext.contentResolver.openInputStream(file.uri)
            inputStream?.copyTo(outputStream)
            inputStream?.close()

            outputStream.writeBytes("\r\n--$boundary--")
            outputStream.flush()
            outputStream.close()

            val responseCode = connection.responseCode
            Log.d("CallUploadWorker", "Server Response: $responseCode")
            
            if (responseCode !in 200..299) {
                val errorStream = connection.errorStream
                if (errorStream != null) {
                    val errorString = errorStream.bufferedReader().use { it.readText() }
                    Log.e("CallUploadWorker", "Server Error Body: $errorString")
                }
            }

            return responseCode in 200..299
        } catch (e: Exception) {
            Log.e("CallUploadWorker", "Upload failed", e)
            return false
        } finally {
            connection.disconnect()
        }
    }

    private fun writeFormField(outputStream: DataOutputStream, boundary: String, fieldName: String, value: String) {
        outputStream.writeBytes("--$boundary\r\n")
        outputStream.writeBytes("Content-Disposition: form-data; name=\"$fieldName\"\r\n\r\n")
        outputStream.writeBytes("$value\r\n")
    }
}
