$content = Get-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Raw

# Find markdown-body section
$startMarker = "<div class=`"markdown-body`">"
$endMarker = "</main>"

$startIdx = $content.IndexOf($startMarker)
if ($startIdx -ge 0) {
    $startIdx += $startMarker.Length
    $endIdx = $content.IndexOf($endMarker, $startIdx)
    if ($endIdx -ge 0) {
        $before = $content.Substring(0, $startIdx)
        $middle = $content.Substring($startIdx, $endIdx - $startIdx)
        $after = $content.Substring($endIdx)
        
        # Only convert h3 tags that match question patterns (A1-A10, B11-B16, C17-C20, D21-D22)
        # These have ids like "a1-define-...", "b11-explain-...", "c17-describe-...", "d21-a-mid-size-..."
        $middle = $middle -replace "(<h3 id=`"(a[1-9]|a10|b1[1-6]|c1[7-9]|c20|d2[12])[^`"]*`"[^>]*>)(.*?)(</h3>)", "<details><summary>`$2</summary>"
        $middle = $middle -replace "(</h3>\s*<p>)", "</summary><p>"
        $middle = $middle -replace "(</h3>\s*<ol>)", "</summary><ol>"
        $middle = $middle -replace "(</h3>\s*<div>)", "</summary><div>"
        $middle = $middle -replace "(</p>\s*<hr)", "</p></details><hr>"
        $middle = $middle -replace "(</p>\s*</div>)", "</p></details></div>"
        $middle = $middle -replace "(</ol>\s*<hr)", "</ol></details><hr>"
        $middle = $middle -replace "(</div>\s*<hr)", "</div></details><hr>"
        
        $content = $before + $middle + $after
    }
}

Set-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Value $content -Encoding UTF8
