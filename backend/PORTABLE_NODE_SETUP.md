# Portable Node.js Setup (No Admin)

This guide installs Node.js locally under the project directory (user space) so you can run `npm install` and tests without admin rights.

## Directory Layout
```
backend/
  .node/        # portable node home (created by you)
    node.exe
    npm
    npx
```

## Steps

1. Create a directory for the portable runtime:
```
mkdir .node
```

2. Download a Node.js Windows zip (LTS) using PowerShell:
```
$version = '20.11.1'
$zip = "node-v$version-win-x64.zip"
Invoke-WebRequest -Uri "https://nodejs.org/dist/v$version/$zip" -OutFile $zip
Expand-Archive $zip -DestinationPath .node -Force
Move-Item .node\node-v$version-win-x64\* .node\
Remove-Item $zip
Remove-Item .node\node-v$version-win-x64 -Recurse -Force
```

3. (Optional) Add temporary PATH for current session:
```
$env:PATH = (Resolve-Path '.node').Path + ';' + $env:PATH
```

4. Verify:
```
.node\node.exe -v
.node\npm.cmd -v
```

5. Use npm via explicit path (avoids needing PATH change):
```
.node\npm.cmd install
.node\npm.cmd test
```

## One-Liner Helper (Download + Extract + Install Deps)
```
$version='20.11.1'; $zip="node-v$version-win-x64.zip"; Invoke-WebRequest -Uri "https://nodejs.org/dist/v$version/$zip" -OutFile $zip; if(!(Test-Path .node)){mkdir .node|Out-Null}; Expand-Archive $zip -DestinationPath .node -Force; Move-Item .node\node-v$version-win-x64\* .node\; Remove-Item $zip; Remove-Item .node\node-v$version-win-x64 -Recurse -Force; .node\npm.cmd install; .node\npm.cmd test
```

## Running Scripts
Instead of `npm`, prefix with `.node\npm.cmd`, e.g.:
```
.node\npm.cmd run start
```

## Cleanup
Delete `.node` directory to remove the portable runtime.

## Notes
- Uses official Node.js distribution.
- No registry or system PATH modifications.
- Suitable for CI-like local sandbox or restricted corp machines.
