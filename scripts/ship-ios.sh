#!/usr/bin/env bash
# Builds the iOS app and uploads it to TestFlight, entirely from the
# terminal. Signs with whatever Apple account Xcode is signed in to
# (Xcode → Settings → Accounts), via -allowProvisioningUpdates — no API
# keys or certificates live in this repo.
#
# Usage:
#   scripts/ship-ios.sh            bump the build number, archive, upload
#   scripts/ship-ios.sh --dry-run  archive and export locally, no bump, no upload
#
# The bumped CURRENT_PROJECT_VERSION in project.yml (and the regenerated
# .xcodeproj) is left for you to commit — App Store Connect rejects a
# build number it has already seen, so it has to move forward every upload.
set -euo pipefail

cd "$(dirname "$0")/../ios/ManualBrain"

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

if [[ $DRY_RUN -eq 0 ]]; then
  current=$(sed -nE 's/^ *CURRENT_PROJECT_VERSION: "([0-9]+)".*/\1/p' project.yml)
  next=$((current + 1))
  sed -i '' -E "s/^( *CURRENT_PROJECT_VERSION: )\"$current\"/\1\"$next\"/" project.yml
  echo "Build number $current → $next"
fi

xcodegen generate --quiet

BUILD_DIR=$(mktemp -d)
ARCHIVE="$BUILD_DIR/ManualBrain.xcarchive"
EXPORT_OPTIONS="$BUILD_DIR/ExportOptions.plist"
cat > "$EXPORT_OPTIONS" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>$([[ $DRY_RUN -eq 1 ]] && echo export || echo upload)</string>
  <key>teamID</key><string>WJ3ZL8A7H3</string>
  <key>signingStyle</key><string>automatic</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict>
</plist>
PLIST

xcodebuild archive \
  -project ManualBrain.xcodeproj \
  -scheme ManualBrain \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  -allowProvisioningUpdates \
  -quiet

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -exportPath "$BUILD_DIR/export" \
  -allowProvisioningUpdates

if [[ $DRY_RUN -eq 1 ]]; then
  echo "Dry run OK — exported to $BUILD_DIR/export (nothing uploaded)"
else
  rm -rf "$BUILD_DIR"
  echo "Uploaded build $next to App Store Connect — it shows in TestFlight once processing finishes (usually 5–15 min)."
fi
