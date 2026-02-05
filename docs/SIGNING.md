# Signing & Notarization Guide

This guide explains how to obtain signing credentials for macOS, Windows, and Linux, and how to store them in GitHub Secrets for CI builds.

## macOS (Developer ID + Notarization)

### Requirements

- Apple Developer Program membership (paid)
- Developer ID Application certificate
- App Store Connect API key (recommended)

### Steps

1. Enroll in the Apple Developer Program
   - https://developer.apple.com/programs/

2. Create a Developer ID Application certificate
   - Apple Developer portal -> Certificates -> “Developer ID Application”
   - Install the certificate in Keychain Access

3. Export the signing certificate (.p12)
   - Open Keychain Access
   - Find “Developer ID Application” certificate
   - Export as `.p12`
   - Choose a strong export password

4. Create an App Store Connect API Key
   - https://appstoreconnect.apple.com/access/api
   - Download the `.p8` key
   - Note the Key ID and Issuer ID

5. Encode certificates for GitHub Secrets
   - Base64 the `.p12` and `.p8` files
   - Example:
     - `base64 -i certificate.p12 | pbcopy`
     - `base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy`

### GitHub Secrets (macOS)

Add these to GitHub -> Settings -> Secrets and variables -> Actions:

- `APPLE_CERT_BASE64` (base64 of .p12)
- `APPLE_CERT_PASSWORD` (password used when exporting the .p12)
- `APPLE_API_KEY_ID` (App Store Connect key ID)
- `APPLE_API_ISSUER_ID` (App Store Connect issuer ID)
- `APPLE_API_KEY_BASE64` (base64 of .p8)

### Notes

- `electron-builder` will use the API key for notarization.
- If you prefer Apple ID based notarization, use `APPLE_ID` and `APPLE_APP_SPECIFIC_PASSWORD` instead.

## Windows (Code Signing)

### Requirements

- Code signing certificate (EV or Standard)
- `.pfx` file export with password

### Steps

1. Purchase a code signing certificate
   - EV is recommended for smoother SmartScreen reputation

2. Export to `.pfx`
   - Follow your CA’s export instructions
   - Ensure you have a strong password

3. Encode for GitHub Secrets
   - Base64 encode the `.pfx`
   - Example:
     - `base64 -i certificate.pfx | pbcopy`

### GitHub Secrets (Windows)

- `WIN_CSC_LINK` (base64 of .pfx)
- `WIN_CSC_KEY_PASSWORD` (pfx password)

## Linux (Optional Signing)

Linux signing is optional. Most distributions do not require signed AppImage/DEB/RPM for local installs.

If you want GPG signing:

### GitHub Secrets (Linux)

- `LINUX_GPG_PRIVATE_KEY` (ASCII-armored GPG private key)
- `LINUX_GPG_PASSPHRASE` (key passphrase)

### Notes

- Import the GPG key in CI before running `electron-builder`.
- Some targets (DEB/RPM) can be signed; AppImage signing is optional.

## CI Integration Notes

- Signing is driven by `electron-builder` environment variables.
- CI should decode base64 secrets into files before running `electron-builder`.
- Keep all signing secrets in GitHub Actions secrets.

## Verification

### macOS

- Verify codesign:
  - `codesign --verify --deep --strict --verbose=2 <App.app>`
- Verify notarization:
  - `xcrun stapler validate <App.app>`

### Windows

- Verify signature:
  - `signtool verify /pa /v <YourApp.exe>`
