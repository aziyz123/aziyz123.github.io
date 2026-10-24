package uz.oquv.vositalari;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/** saytni (https://aziyz123.github.io) to'liq ekranli ilova ichida ko'rsatadi. */
public class MainActivity extends Activity {

    private static final String HOME = "https://aziyz123.github.io/";
    private static final int REQ_FILE = 1001;
    private static final int REQ_CAMERA = 1002;
    private static final int REQ_STORAGE = 1003;

    private WebView web;
    private ProgressBar bar;
    private ValueCallback<Uri[]> filePathCallback;
    private PermissionRequest pendingPermission;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#0F1116"));
        getWindow().setNavigationBarColor(Color.parseColor("#0F1116"));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0F1116"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0F1116"));
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));

        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(-1, 8);
        root.addView(bar, lp);
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true);

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String scheme = u.getScheme() == null ? "" : u.getScheme();
                String host = u.getHost() == null ? "" : u.getHost();
                boolean inApp = scheme.equals("blob") || scheme.equals("data") || scheme.equals("about")
                        || host.equals("aziyz123.github.io") || host.endsWith(".firebaseio.com")
                        || host.endsWith(".firebasedatabase.app") || host.endsWith(".workers.dev");
                if (inApp) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView v, int p) {
                bar.setProgress(p);
                bar.setVisibility(p >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = cb;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean wantsCam = false;
                    for (String r : request.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) wantsCam = true;
                    }
                    if (wantsCam && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                        pendingPermission = request;
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAMERA);
                    } else {
                        request.grant(request.getResources());
                    }
                });
            }
        });

        web.setDownloadListener((url, ua, cd, mime, len) -> {
            String name = URLUtil.guessFileName(url, cd, mime);
            if (url.startsWith("blob:")) {
                // blob havolani JS orqali o'qib, ilovaga base64 qilib uzatamiz
                String js = "(function(){var x=new XMLHttpRequest();x.open('GET','" + url + "',true);"
                        + "x.responseType='blob';x.onload=function(){var r=new FileReader();"
                        + "r.onloadend=function(){AndroidBridge.save(" + jsStr(name) + "," + jsStr(mime == null ? "" : mime)
                        + ",String(r.result).split(',')[1]||'');};r.readAsDataURL(x.response);};x.send();})();";
                web.evaluateJavascript(js, null);
            } else if (url.startsWith("data:")) {
                int comma = url.indexOf(',');
                if (comma > 0 && url.substring(0, comma).contains("base64")) {
                    saveBytes(name, mime, Base64.decode(url.substring(comma + 1), Base64.DEFAULT));
                }
            } else {
                try {
                    DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
                    req.setMimeType(mime);
                    req.addRequestHeader("User-Agent", ua);
                    String ck = CookieManager.getInstance().getCookie(url);
                    if (ck != null) req.addRequestHeader("Cookie", ck);
                    req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                    ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(req);
                    toast("Yuklab olinmoqda: " + name);
                } catch (Exception e) {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                }
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(HOME);
    }

    private static String jsStr(String v) {
        return "'" + v.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'";
    }

    private void toast(String m) {
        runOnUiThread(() -> Toast.makeText(this, m, Toast.LENGTH_LONG).show());
    }

    /** Faylni "Yuklashlar" (Downloads) papkasiga saqlaydi. */
    private void saveBytes(String name, String mime, byte[] data) {
        try {
            if (name == null || name.isEmpty()) name = "fayl";
            name = name.replaceAll("[\\\\/:*?\"<>|]", "_");
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                if (mime != null && !mime.isEmpty()) v.put(MediaStore.Downloads.MIME_TYPE, mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new Exception("uri yo'q");
                try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                    os.write(data);
                }
            } else {
                if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_STORAGE);
                    toast("Ruxsat bering va faylni qayta yuklab oling");
                    return;
                }
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                dir.mkdirs();
                try (FileOutputStream os = new FileOutputStream(new File(dir, name))) {
                    os.write(data);
                }
            }
            toast("Saqlandi: Yuklashlar/" + name);
        } catch (Exception e) {
            toast("Saqlab bo'lmadi: " + e.getMessage());
        }
    }

    private class Bridge {
        @JavascriptInterface
        public void save(String name, String mime, String b64) {
            saveBytes(name, mime, Base64.decode(b64, Base64.DEFAULT));
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE && filePathCallback != null) {
            filePathCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            filePathCallback = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        if (req == REQ_CAMERA && pendingPermission != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
                pendingPermission.grant(pendingPermission.getResources());
            } else {
                pendingPermission.deny();
            }
            pendingPermission = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }
}
