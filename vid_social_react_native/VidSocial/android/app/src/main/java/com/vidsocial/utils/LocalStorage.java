package  com.inwi.vidsocial.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class LocalStorage {
    private static final String PREFS_NAME = "MyPrefs";

    private SharedPreferences sharedPreferences;

    public LocalStorage(Context context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public void setString(String key, String value) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(key, value);
        editor.apply();
    }

    public String getString(String key) {
        return sharedPreferences.getString(key, null);
    }
}
