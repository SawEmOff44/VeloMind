#!/bin/bash

# Generate UUIDs for the new files
INTEL_ENGINE_REF=$(uuidgen | tr -d '-' | cut -c1-24 | tr '[:upper:]' '[:lower:]')
FITNESS_MGR_REF=$(uuidgen | tr -d '-' | cut -c1-24 | tr '[:upper:]' '[:lower:]')
INTEL_ENGINE_BUILD=$(uuidgen | tr -d '-' | cut -c1-24 | tr '[:upper:]' '[:lower:]')
FITNESS_MGR_BUILD=$(uuidgen | tr -d '-' | cut -c1-24 | tr '[:upper:]' '[:lower:]')
INTEL_GROUP=$(uuidgen | tr -d '-' | cut -c1-24 | tr '[:upper:]' '[:lower:]')

echo "IntelligenceEngine fileRef: 0A$INTEL_ENGINE_REF"
echo "FitnessProfileManager fileRef: 0A$FITNESS_MGR_REF"
echo "Intelligence group: 0A$INTEL_GROUP"

# Backup the project file
cp VeloMind.xcodeproj/project.pbxproj VeloMind.xcodeproj/project.pbxproj.backup2

# Add PBXBuildFile entries (after line with PowerEngine.swift in Sources)
sed -i '' "/PowerEngine.swift in Sources/a\\
\\0A$INTEL_ENGINE_BUILD /* IntelligenceEngine.swift in Sources */ = {isa = PBXBuildFile; fileRef = 0A$INTEL_ENGINE_REF /* IntelligenceEngine.swift */; };\\
\\0A$FITNESS_MGR_BUILD /* FitnessProfileManager.swift in Sources */ = {isa = PBXBuildFile; fileRef = 0A$FITNESS_MGR_REF /* FitnessProfileManager.swift */; };
" VeloMind.xcodeproj/project.pbxproj

# Add PBXFileReference entries (after line with PowerEngine.swift fileRef)
sed -i '' "/0A00010E.*PowerEngine.swift.*PBXFileReference/a\\
\\0A$INTEL_ENGINE_REF /* IntelligenceEngine.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = IntelligenceEngine.swift; sourceTree = \"<group>\"; };\\
\\0A$FITNESS_MGR_REF /* FitnessProfileManager.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = FitnessProfileManager.swift; sourceTree = \"<group>\"; };
" VeloMind.xcodeproj/project.pbxproj

# Add group entry (after PowerEngine group)
sed -i '' "/name = PowerEngine;/a\\
\\0A$INTEL_GROUP /* Intelligence */ = {\\
\\isa = PBXGroup;\\
\\children = (\\
\\0A$INTEL_ENGINE_REF /* IntelligenceEngine.swift */,\\
\\0A$FITNESS_MGR_REF /* FitnessProfileManager.swift */,\\
\\);\\
\\path = Intelligence;\\
\\sourceTree = \"<group>\";\\
\\};
" VeloMind.xcodeproj/project.pbxproj

# Add group reference to VeloMind group (after PowerEngine line)
sed -i '' "/0A00020D.*PowerEngine/a\\
\\0A$INTEL_GROUP /* Intelligence */,
" VeloMind.xcodeproj/project.pbxproj

# Add to Sources build phase (after PowerEngine.swift in Sources)
sed -i '' "/0A00000E.*PowerEngine.swift in Sources/a\\
\\0A$INTEL_ENGINE_BUILD /* IntelligenceEngine.swift in Sources */,\\
\\0A$FITNESS_MGR_BUILD /* FitnessProfileManager.swift in Sources */,
" VeloMind.xcodeproj/project.pbxproj

echo "Added Intelligence files to Xcode project"
