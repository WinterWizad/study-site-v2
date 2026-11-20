$content = Get-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Raw; $css = @"
/* FAQ-style details/summary styling */
details {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin: 12px 0;
    padding: 0;
    background: #fafafa;
    overflow: hidden;
}
details summary {
    cursor: pointer;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 14px;
    color: #1e3a5f;
    background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
    border-bottom: 1px solid #e0e0e0;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
}
details summary::-webkit-details-marker {
    display: none;
}
details summary::before {
    content: "\25B6";
    font-size: 10px;
    color: #2563eb;
    transition: transform 0.2s;
    display: inline-block;
}
details[open] summary::before {
    transform: rotate(90deg);
}
details[open] {
    background: white;
    border-color: #2563eb;
    box-shadow: 0 2px 8px rgba(37,99,235,0.1);
}
details[open] summary {
    border-bottom-color: #2563eb;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}
details > *:not(summary) {
    padding: 16px;
}
details summary:hover {
    background: linear-gradient(135deg, #e8eef5 0%, #dbeafe 100%);
}
@media print {
    details {
        border: none;
        background: none;
        margin: 8px 0;
        padding: 0;
    }
    details summary {
        border: none;
        background: none;
        padding: 4px 0;
        font-size: 13px;
    }
    details[open] {
        background: none;
        box-shadow: none;
    }
    details summary::before {
        content: "";
    }
}
"@; $styleTag = "<style>`n$css`n</style>"; $content = Get-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Raw; $content = $content -replace "(</head>)", "`$styleTag`$1"; Set-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Value $content -Encoding UTF8
