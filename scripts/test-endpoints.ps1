# PowerShell Script to Test Segmented Planning Endpoints
# Usage: .\scripts\test-endpoints.ps1

Write-Host "`n🧪 Segmented Planning Endpoint Tests`n" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:3000"
$testEndpoint = "$baseUrl/api/vibe/test/segmented-planning"

# Check if server is running
Write-Host "📡 Checking if dev server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server is running!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host "   Please start the dev server first: npm run dev`n" -ForegroundColor Yellow
    exit 1
}

# Test 1: Create test project and start segmented planning
Write-Host "📝 Test 1: Creating test project and starting segmented planning..." -ForegroundColor Yellow
Write-Host "   Endpoint: POST $testEndpoint" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $testEndpoint -Method POST -ContentType "application/json" -UseBasicParsing
    
    if ($response.success) {
        Write-Host "✅ Test project created successfully!`n" -ForegroundColor Green
        Write-Host "   Project ID: $($response.projectId)" -ForegroundColor White
        Write-Host "   Session ID: $($response.sessionId)" -ForegroundColor White
        
        $projectId = $response.projectId
        $sessionId = $response.sessionId
        
        # Save for later tests
        $projectId | Out-File -FilePath "test-project-id.txt" -NoNewline
        
    } else {
        Write-Host "❌ Failed to create test project" -ForegroundColor Red
        Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ Request failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "`n⚠️  Make sure you're logged in to the application!`n" -ForegroundColor Yellow
    exit 1
}

# Test 2: Monitor progress (check multiple times)
$progressEndpoint = "$baseUrl/api/vibe/projects/$projectId/plan/segmented"
Write-Host "`n📊 Test 2: Monitoring planning progress..." -ForegroundColor Yellow
Write-Host "   Endpoint: GET $progressEndpoint`n" -ForegroundColor Gray

$maxChecks = 60  # Check for up to 5 minutes (60 * 5 seconds)
$checkInterval = 5  # seconds
$checkCount = 0
$lastCompletedCount = 0

while ($checkCount -lt $maxChecks) {
    $checkCount++
    
    try {
        $progress = Invoke-RestMethod -Uri $progressEndpoint -Method GET -UseBasicParsing
        
        if ($progress.success) {
            $status = $progress.plan.status
            $completedCount = $progress.plan.completedSections.Count
            $totalSections = 12
            $percentage = $progress.progress.progress
            
            # Show new completions
            if ($completedCount -gt $lastCompletedCount) {
                $newSections = $progress.plan.completedSections[$lastCompletedCount..($completedCount-1)]
                foreach ($sectionId in $newSections) {
                    $section = $progress.plan.sectionsData.$sectionId
                    if ($section) {
                        Write-Host "   ✓ $($section.name)" -ForegroundColor Green
                        $explanation = $section.simpleExplanation.Substring(0, [Math]::Min(80, $section.simpleExplanation.Length))
                        Write-Host "     $explanation..." -ForegroundColor Gray
                    }
                }
                $lastCompletedCount = $completedCount
            }
            
            # Show progress bar
            $barLength = 40
            $filledLength = [Math]::Floor($percentage / 100 * $barLength)
            $bar = "█" * $filledLength + "░" * ($barLength - $filledLength)
            Write-Host "`r   Progress: [$bar] $percentage% ($completedCount/$totalSections) - Status: $status" -NoNewline -ForegroundColor Cyan
            
            # Check if complete
            if ($status -eq "completed") {
                Write-Host "`n`n✅ Planning completed successfully!`n" -ForegroundColor Green
                
                # Show summary
                Write-Host "📋 Plan Summary:" -ForegroundColor Yellow
                Write-Host "   Total Sections: $completedCount/$totalSections" -ForegroundColor White
                
                # Calculate total cost
                $totalCost = 0
                $totalTokens = 0
                foreach ($sectionId in $progress.plan.completedSections) {
                    $section = $progress.plan.sectionsData.$sectionId
                    if ($section.aiUsage) {
                        $totalCost += $section.aiUsage.cost
                        $totalTokens += $section.aiUsage.tokensUsed
                    }
                }
                
                Write-Host "   Total Cost: `$$($totalCost.ToString('F6'))" -ForegroundColor White
                Write-Host "   Total Tokens: $totalTokens" -ForegroundColor White
                
                # Show project understanding
                if ($progress.plan.sectionsData.projectUnderstanding) {
                    Write-Host "`n💡 Project Understanding:" -ForegroundColor Yellow
                    Write-Host "   $($progress.plan.sectionsData.projectUnderstanding.simpleExplanation)" -ForegroundColor White
                }
                
                # Show features
                if ($progress.plan.sectionsData.coreFeatures) {
                    $features = $progress.plan.sectionsData.coreFeatures.data.features
                    Write-Host "`n🎯 Core Features: $($features.Count)" -ForegroundColor Yellow
                    $features | Select-Object -First 3 | ForEach-Object {
                        Write-Host "   • $($_.name) ($($_.priority))" -ForegroundColor White
                    }
                }
                
                # Show tech stack
                if ($progress.plan.sectionsData.techStack) {
                    Write-Host "`n⚙️  Tech Stack:" -ForegroundColor Yellow
                    $tech = $progress.plan.sectionsData.techStack.data
                    if ($tech.framework) {
                        Write-Host "   Framework: $($tech.framework.name)" -ForegroundColor White
                    }
                    if ($tech.database) {
                        Write-Host "   Database: $($tech.database.name)" -ForegroundColor White
                    }
                }
                
                Write-Host "`n✅ All tests passed!`n" -ForegroundColor Green
                break
            }
            elseif ($status -eq "failed") {
                Write-Host "`n`n❌ Planning failed!" -ForegroundColor Red
                break
            }
            
            # Wait before next check
            Start-Sleep -Seconds $checkInterval
            
        } else {
            Write-Host "`n❌ Failed to get progress" -ForegroundColor Red
            break
        }
    } catch {
        Write-Host "`n❌ Error checking progress: $($_.Exception.Message)" -ForegroundColor Red
        break
    }
}

if ($checkCount -ge $maxChecks) {
    Write-Host "`n⏰ Timeout after 5 minutes" -ForegroundColor Yellow
    Write-Host "   Planning may still be running. Check manually:" -ForegroundColor Gray
    Write-Host "   GET $progressEndpoint`n" -ForegroundColor Gray
}

# Test 3: View in browser
Write-Host "`n🌐 Test 3: View plan in browser" -ForegroundColor Yellow
Write-Host "   URL: $baseUrl/dashboard/vibe/projects/$projectId/plan" -ForegroundColor White
Write-Host "`n   Opening in browser..." -ForegroundColor Gray
Start-Process "$baseUrl/dashboard/vibe/projects/$projectId/plan"

Write-Host "`n✅ Testing complete!`n" -ForegroundColor Green
Write-Host "📝 Project ID saved to: test-project-id.txt" -ForegroundColor Gray
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Check the browser window that opened" -ForegroundColor White
Write-Host "2. Verify all sections are displayed correctly" -ForegroundColor White
Write-Host "3. Check MongoDB for the complete plan data`n" -ForegroundColor White
