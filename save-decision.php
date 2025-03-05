<?php
// save_decision.php

$dataFile = 'decisions.json';

// Get the decision from POST
$decision = isset($_POST['decision']) ? $_POST['decision'] : '';

if ($decision !== 'yes' && $decision !== 'no') {
    http_response_code(400);
    echo json_encode(['error' => 'Nevažeći unos']);
    exit;
}

// Load existing data
if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $data = json_decode($jsonData, true);
    if (!is_array($data)) {
        $data = [];
    }
} else {
    $data = [];
}

// Append new decision with a timestamp
$data[] = ['decision' => $decision, 'timestamp' => date("c")];

// Save the updated data back to the JSON file
file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

// Calculate aggregated data (for example, percentage of "yes" decisions)
$total = count($data);
$yesCount = count(array_filter($data, function($entry) {
    return $entry['decision'] === 'yes';
}));
$percentageYes = round(($yesCount / $total) * 100);

// Create aggregated result text
if ($percentageYes >= 50) {
    $aggregatedText = $percentageYes . "% ljudi je obuklo jaknu.";
} else {
    $aggregatedText = $percentageYes . "% ljudi nije obuklo jaknu.";
}

// Return the result as JSON
header('Content-Type: application/json');
echo json_encode(['aggregated' => $aggregatedText]);
?>
