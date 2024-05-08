package  com.inwi.vidsocial.utils;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.util.Log;

public class SessionManager {
	// LogCat tag
	private static String TAG = SessionManager.class.getSimpleName();

	// Shared Preferences
	SharedPreferences pref;

	Editor editor;
	Context _context;

	// Shared pref mode
	int PRIVATE_MODE = 0;
	private static final String PREF_NAME = "app_pref_trulinco";
	private static final String KEY_IS_LOGGEDIN = "isLoggedIn";

	public SessionManager(Context context) {
		this._context = context;
		pref = _context.getSharedPreferences(PREF_NAME, PRIVATE_MODE);
		editor = pref.edit();
	}

	public void setLogin(boolean isLoggedIn) {
		editor.putBoolean(KEY_IS_LOGGEDIN, isLoggedIn);
		editor.commit();
		Log.d(TAG, "User login session modified!");
	}

	public void setValue(String key, Boolean value){
		editor.putBoolean(key.toUpperCase(), value);
		editor.commit();
	}

	public void setValue(String key, Long value){
		editor.putLong(key.toUpperCase(), value);
		editor.commit();
	}

	public void setValue(String key, int value){
		editor.putInt(key.toUpperCase(), value);
		editor.commit();
	}
	public void setValue(String key, double value){
		editor.putFloat(key.toUpperCase(),Float.valueOf(String.valueOf(value)));
		editor.commit();
	}
	public void setValue(String key, String value){
		editor.putString(key.toUpperCase(), value);
		editor.commit();
	}

	public Boolean getBooleanValue(String key)
	{
		return pref.getBoolean(key.toUpperCase(),false);
	}

	public long getLongValue(String key)
	{
		return pref.getLong(key.toUpperCase(),-1);
	}

	public int getIntValue(String key)
	{
		return pref.getInt(key.toUpperCase(), -1);
	}

	public Double getDoubleValue(String key){
		return Double.parseDouble(String.valueOf(pref.getFloat(key.toUpperCase(), -1)));
	}

	public String getStringValue(String key)
	{
		return pref.getString(key.toUpperCase(),"");
	}

	public boolean isLoggedIn(){
		return pref.getBoolean(KEY_IS_LOGGEDIN, false);
	}

	public void destroy()
	{
		setLogin(false);
		editor.clear();
		editor.commit();
	}
}