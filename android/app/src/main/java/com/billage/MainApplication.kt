package com.billage

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // 'Pyeojin Gothic' 한 패밀리로 굵기별 ttf(res/font)를 묶어 등록한다.
    // JS에서는 fontFamily: 'Pyeojin Gothic' + fontWeight로 굵기를 고른다.
    ReactFontManager.getInstance().addCustomFont(this, "Pyeojin Gothic", R.font.pyeojin_gothic)
    loadReactNative(this)
  }
}
