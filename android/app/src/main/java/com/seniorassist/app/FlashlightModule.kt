package com.seniorassist.app

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FlashlightModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var isTorchOn: Boolean = false

    override fun getName(): String = "FlashlightModule"

    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            val cameraManager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
            if (cameraManager == null) {
                promise.resolve(false)
                return
            }
            val cameraIds = cameraManager.cameraIdList
            promise.resolve(cameraIds.isNotEmpty())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun setTorchMode(enabled: Boolean, promise: Promise) {
        try {
            val cameraManager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
            if (cameraManager == null) {
                promise.reject("CAMERA_ERROR", "Camera service unavailable")
                return
            }
            val cameraIds = cameraManager.cameraIdList
            if (cameraIds.isEmpty()) {
                promise.reject("NO_CAMERA", "No camera detected on device")
                return
            }
            val backCameraId = cameraIds[0]
            cameraManager.setTorchMode(backCameraId, enabled)
            isTorchOn = enabled
            promise.resolve(enabled)
        } catch (e: CameraAccessException) {
            promise.reject("CAMERA_ACCESS_ERROR", e.message)
        } catch (e: Exception) {
            promise.reject("TORCH_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getTorchMode(promise: Promise) {
        promise.resolve(isTorchOn)
    }
}
