<?php

$path = __DIR__ . '/../vendor/nesbot/carbon/src/Carbon/Carbon.php';

if (!file_exists($path)) {
    fwrite(STDERR, "Carbon patch skipped: {$path} not found.\n");
    exit(0);
}

$source = file_get_contents($path);
$search = '    private static function setLastErrors(array $lastErrors)
    {
        static::$lastErrors = $lastErrors;
    }';
$replace = '    private static function setLastErrors($lastErrors)
    {
        static::$lastErrors = $lastErrors ?: [
            "warning_count" => 0,
            "warnings" => [],
            "error_count" => 0,
            "errors" => [],
        ];
    }';

if (strpos($source, $replace) !== false) {
    exit(0);
}

if (strpos($source, $search) === false) {
    fwrite(STDERR, "Carbon patch skipped: target block not found.\n");
    exit(0);
}

file_put_contents($path, str_replace($search, $replace, $source));
