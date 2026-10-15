package com.seniorassist.app

import android.content.Intent
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class SeniorSpeechModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), RecognitionListener {
    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isListening: Boolean = false
    private var systemRingtone: Ringtone? = null

    override fun getName(): String = "SeniorSpeechModule"

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            // Ignorar si el contexto ya no está activo
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Requerido por React Native NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Requerido por React Native NativeEventEmitter
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            val available = SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)
            promise.resolve(available)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        mainHandler.post {
            try {
                // Destruir instancia previa de forma segura
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer?.cancel()
                        speechRecognizer?.destroy()
                    } catch (e: Exception) {}
                    speechRecognizer = null
                }

                if (!SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)) {
                    sendEvent("onSpeechError", "El servicio de reconocimiento de voz no está disponible en este dispositivo.")
                    promise.resolve(false)
                    return@post
                }

                // Usar siempre el contexto de aplicación para máxima estabilidad en cualquier pantalla
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                speechRecognizer?.setRecognitionListener(this)

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-ES")
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "es-ES")
                    putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "es-ES")
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                    putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactApplicationContext.packageName)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 3500L)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2500L)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 1500L)
                }

                speechRecognizer?.startListening(intent)
                isListening = true
                sendEvent("onSpeechStart", null)
                promise.resolve(true)
            } catch (e: Exception) {
                isListening = false
                sendEvent("onSpeechError", e.message ?: "No fue posible iniciar el reconocimiento de voz.")
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        mainHandler.post {
            try {
                if (isListening && speechRecognizer != null) {
                    speechRecognizer?.stopListening()
                }
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun cancelListening(promise: Promise) {
        mainHandler.post {
            try {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer?.cancel()
                        speechRecognizer?.destroy()
                    } catch (e: Exception) {}
                    speechRecognizer = null
                }
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                isListening = false
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun playSystemAlarm(promise: Promise) {
        mainHandler.post {
            try {
                systemRingtone?.stop()
                systemRingtone = null

                val alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                    ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
                    ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

                if (alertUri != null) {
                    val ringtone = RingtoneManager.getRingtone(reactApplicationContext, alertUri)
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                        val audioAttrs = android.media.AudioAttributes.Builder()
                            .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                            .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                        ringtone.audioAttributes = audioAttrs
                    }
                    ringtone.play()
                    systemRingtone = ringtone
                    promise.resolve(true)
                } else {
                    promise.resolve(false)
                }
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun stopSystemAlarm(promise: Promise) {
        mainHandler.post {
            try {
                systemRingtone?.stop()
                systemRingtone = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun destroy(promise: Promise) {
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
                systemRingtone?.stop()
                systemRingtone = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    // Callbacks de RecognitionListener
    override fun onReadyForSpeech(params: Bundle?) {
        sendEvent("onSpeechReady", null)
    }

    override fun onBeginningOfSpeech() {
        sendEvent("onSpeechBegin", null)
    }

    override fun onRmsChanged(rmsdB: Float) {}

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        sendEvent("onSpeechEnd", null)
    }

    override fun onError(error: Int) {
        isListening = false
        // Limpiar forzosamente la instancia nativa para liberar el buffer de audio y evitar que quede ocupado
        try {
            speechRecognizer?.cancel()
            speechRecognizer?.destroy()
        } catch (e: Exception) {}
        speechRecognizer = null

        val errorMsg = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Error al capturar audio del micrófono"
            SpeechRecognizer.ERROR_CLIENT -> "El reconocedor no pudo procesar la voz"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Permiso de micrófono no otorgado"
            SpeechRecognizer.ERROR_NETWORK -> "Se requiere conexión a internet para reconocer la voz"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Tiempo de espera agotado"
            SpeechRecognizer.ERROR_NO_MATCH -> "No se reconoció ninguna frase clara"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "El micrófono estaba ocupado"
            SpeechRecognizer.ERROR_SERVER -> "Servidor de voz no disponible"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No se detectó voz"
            else -> "Error de voz ($error)"
        }
        sendEvent("onSpeechError", errorMsg)
    }

    override fun onResults(results: Bundle?) {
        isListening = false
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        try {
            speechRecognizer?.cancel()
            speechRecognizer?.destroy()
        } catch (e: Exception) {}
        speechRecognizer = null

        if (!matches.isNullOrEmpty()) {
            val text = matches[0]
            val params = Arguments.createMap().apply {
                putString("text", text)
                putBoolean("isFinal", true)
            }
            sendEvent("onSpeechResult", params)
        } else {
            sendEvent("onSpeechError", "No se detectaron palabras en la grabación.")
        }
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val text = matches[0]
            val params = Arguments.createMap().apply {
                putString("text", text)
                putBoolean("isFinal", false)
            }
            sendEvent("onSpeechPartialResult", params)
        }
    }

    @ReactMethod
    fun directPhoneCall(phoneNumber: String, promise: Promise) {
        try {
            val cleanPhone = phoneNumber.replace("[^0-9+]".toRegex(), "")
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = android.net.Uri.parse("tel:$cleanPhone")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            // Fallback a ACTION_DIAL si no cuenta con permiso en tiempo de ejecución
            try {
                val cleanPhone = phoneNumber.replace("[^0-9+]".toRegex(), "")
                val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                    data = android.net.Uri.parse("tel:$cleanPhone")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactApplicationContext.startActivity(dialIntent)
                promise.resolve(true)
            } catch (err: Exception) {
                promise.reject("CALL_ERROR", err.message)
            }
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}
}
