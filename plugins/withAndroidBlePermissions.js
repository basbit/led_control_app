const { withAndroidManifest } = require("@expo/config-plugins");

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function upsertUsesPermission(usesPermissions, attrs) {
  const name = attrs["android:name"];
  const idx = usesPermissions.findIndex(p => p?.$?.["android:name"] === name);
  if (idx === -1) {
    usesPermissions.push({ $: attrs });
    return;
  }
  usesPermissions[idx].$ = { ...usesPermissions[idx].$, ...attrs };
}

module.exports = function withAndroidBlePermissions(config) {
  return withAndroidManifest(config, async configWithManifest => {
    const manifest = configWithManifest.modResults.manifest;
    manifest["uses-permission"] = ensureArray(manifest["uses-permission"]);
    const usesPermissions = manifest["uses-permission"];

    // Android 12+ BLE permissions
    upsertUsesPermission(usesPermissions, {
      "android:name": "android.permission.BLUETOOTH_SCAN",
      "android:usesPermissionFlags": "neverForLocation",
    });
    upsertUsesPermission(usesPermissions, {
      "android:name": "android.permission.BLUETOOTH_CONNECT",
    });

    // Android <= 11 legacy BLE permissions (limit to <=30)
    upsertUsesPermission(usesPermissions, {
      "android:name": "android.permission.BLUETOOTH",
      "android:maxSdkVersion": "30",
    });
    upsertUsesPermission(usesPermissions, {
      "android:name": "android.permission.BLUETOOTH_ADMIN",
      "android:maxSdkVersion": "30",
    });

    // Location is required for scanning on API 23-30 for many BLE stacks
    upsertUsesPermission(usesPermissions, {
      "android:name": "android.permission.ACCESS_FINE_LOCATION",
      "android:maxSdkVersion": "30",
    });

    // Keep coarse location if it exists, but also limit to <=30
    const coarseIdx = usesPermissions.findIndex(
      p => p?.$?.["android:name"] === "android.permission.ACCESS_COARSE_LOCATION"
    );
    if (coarseIdx !== -1) {
      usesPermissions[coarseIdx].$ = {
        ...usesPermissions[coarseIdx].$,
        "android:maxSdkVersion": "30",
      };
    }

    return configWithManifest;
  });
};

