<?php

namespace App\Services;

use App\Models\Link;
use App\Models\Visit;
use Illuminate\Support\Facades\Storage;
use League\Csv\Writer;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Log;

class AnalyticsExportService
{
    public function exportToCsv(Link $link, string $format = 'visits', ?string $startDate = null, ?string $endDate = null)
    {
        Log::info("Starting CSV export for link ID: {$link->id}, format: {$format}, date range: {$startDate} to {$endDate}");
        
        try {
            // Build query with date range filter
            $visitsQuery = $link->visits()->with('link');
            
            if ($startDate) {
                $visitsQuery->whereDate('visited_at', '>=', $startDate);
            }
            if ($endDate) {
                $visitsQuery->whereDate('visited_at', '<=', $endDate);
            }
            
            $visits = $visitsQuery->get();
            Log::info("Retrieved {$visits->count()} visits for link ID: {$link->id}");
            
            $csv = Writer::createFromString('');
            
            switch ($format) {
                case 'visits':
                    Log::info("Processing visits format for link ID: {$link->id}");
                    $csv->insertOne([
                        'Date',
                        'IP Address',
                        'Country',
                        'City',
                        'Browser',
                        'Platform',
                        'Device Type',
                        'Screen Resolution',
                        'Referrer URL'
                    ]);
                    
                    foreach ($visits as $visit) {
                        // Format the visited_at field properly
                        $visitedAt = $visit->visited_at;
                        if ($visitedAt instanceof \Carbon\Carbon) {
                            $visitedAt = $visitedAt->format('Y-m-d H:i:s');
                        } elseif (is_string($visitedAt)) {
                            // If it's a string, try to parse it as a date
                            try {
                                $visitedAt = \Carbon\Carbon::parse($visitedAt)->format('Y-m-d H:i:s');
                            } catch (\Exception $e) {
                                // If parsing fails, keep the original string
                                Log::warning("Failed to parse visited_at date: {$visitedAt}");
                            }
                        }
                        
                        $csv->insertOne([
                            $visitedAt,
                            $visit->ip,
                            $visit->country,
                            $visit->city,
                            $visit->browser,
                            $visit->platform,
                            $visit->device_type,
                            $visit->screen_resolution,
                            $visit->referrer_url
                        ]);
                    }
                    break;
                    
                case 'summary':
                    Log::info("Processing summary format for link ID: {$link->id}");
                    $csv->insertOne([
                        'Metric',
                        'Value'
                    ]);
                    
                    $csv->insertOne(['Total Visits', $visits->count()]);
                    $csv->insertOne(['Unique Countries', $visits->pluck('country')->unique()->count()]);
                    
                    $mostCommonBrowser = $visits->pluck('browser')->countBy()->sortDesc()->keys()->first() ?? 'N/A';
                    $mostCommonPlatform = $visits->pluck('platform')->countBy()->sortDesc()->keys()->first() ?? 'N/A';
                    $mostCommonDevice = $visits->pluck('device_type')->countBy()->sortDesc()->keys()->first() ?? 'N/A';
                    
                    $csv->insertOne(['Most Common Browser', $mostCommonBrowser]);
                    $csv->insertOne(['Most Common Platform', $mostCommonPlatform]);
                    $csv->insertOne(['Most Common Device', $mostCommonDevice]);
                    
                    if ($startDate || $endDate) {
                        $csv->insertOne(['Date Range', ($startDate ?? 'All time') . ' to ' . ($endDate ?? 'Present')]);
                    }
                    break;
                    
                default:
                    Log::warning("Unknown format '{$format}' for link ID: {$link->id}, defaulting to visits format");
                    // Default to visits format if an unknown format is provided
                    $csv->insertOne([
                        'Date',
                        'IP Address',
                        'Country',
                        'City',
                        'Browser',
                        'Platform',
                        'Device Type',
                        'Screen Resolution',
                        'Referrer URL'
                    ]);
                    
                    foreach ($visits as $visit) {
                        // Format the visited_at field properly
                        $visitedAt = $visit->visited_at;
                        if ($visitedAt instanceof \Carbon\Carbon) {
                            $visitedAt = $visitedAt->format('Y-m-d H:i:s');
                        } elseif (is_string($visitedAt)) {
                            // If it's a string, try to parse it as a date
                            try {
                                $visitedAt = \Carbon\Carbon::parse($visitedAt)->format('Y-m-d H:i:s');
                            } catch (\Exception $e) {
                                // If parsing fails, keep the original string
                                Log::warning("Failed to parse visited_at date: {$visitedAt}");
                            }
                        }
                        
                        $csv->insertOne([
                            $visitedAt,
                            $visit->ip,
                            $visit->country,
                            $visit->city,
                            $visit->browser,
                            $visit->platform,
                            $visit->device_type,
                            $visit->screen_resolution,
                            $visit->referrer_url
                        ]);
                    }
                    break;
            }
            
            $filename = "analytics_{$link->code}_{$format}_" . now()->format('Y-m-d_His') . '.csv';
            Log::info("Saving CSV file: {$filename}");
            
            // Ensure the exports directory exists
            $exportsPath = storage_path('app/exports');
            if (!file_exists($exportsPath)) {
                mkdir($exportsPath, 0755, true);
                Log::info("Created exports directory: {$exportsPath}");
            }
            
            // Save the file using absolute path
            $filePath = $exportsPath . '/' . $filename;
            file_put_contents($filePath, $csv->toString());
            Log::info("CSV file saved to: {$filePath}");
            
            // Verify the file exists
            if (file_exists($filePath)) {
                Log::info("File exists and is readable: {$filePath}");
            } else {
                Log::error("File does not exist after saving: {$filePath}");
                throw new \Exception("Failed to save CSV file");
            }
            
            return $filename;
        } catch (\Exception $e) {
            Log::error("CSV export failed for link ID: {$link->id}, error: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw $e;
        }
    }
    
    public function exportToExcel(Link $link, ?string $startDate = null, ?string $endDate = null)
    {
        Log::info("Starting Excel export for link ID: {$link->id}, date range: {$startDate} to {$endDate}");
        
        try {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Set headers
            $sheet->setCellValue('A1', 'Date');
            $sheet->setCellValue('B1', 'IP Address');
            $sheet->setCellValue('C1', 'Country');
            $sheet->setCellValue('D1', 'City');
            $sheet->setCellValue('E1', 'Browser');
            $sheet->setCellValue('F1', 'Platform');
            $sheet->setCellValue('G1', 'Device Type');
            $sheet->setCellValue('H1', 'Screen Resolution');
            $sheet->setCellValue('I1', 'Referrer URL');
            
            // Add date range filter info
            if ($startDate || $endDate) {
                $sheet->setCellValue('A2', 'Date Range:');
                $sheet->setCellValue('B2', ($startDate ?? 'All time') . ' to ' . ($endDate ?? 'Present'));
                $sheet->mergeCells('B2:D2');
            }
            
            // Build query with date range filter
            $visitsQuery = $link->visits()->with('link');
            
            if ($startDate) {
                $visitsQuery->whereDate('visited_at', '>=', $startDate);
            }
            if ($endDate) {
                $visitsQuery->whereDate('visited_at', '<=', $endDate);
            }
            
            $visits = $visitsQuery->get();
            Log::info("Retrieved {$visits->count()} visits for Excel export, link ID: {$link->id}");
            
            $row = $startDate || $endDate ? 4 : 2; // Start after date range info if present
            
            foreach ($visits as $visit) {
                // Format the visited_at field properly
                $visitedAt = $visit->visited_at;
                if ($visitedAt instanceof \Carbon\Carbon) {
                    $visitedAt = $visitedAt->format('Y-m-d H:i:s');
                } elseif (is_string($visitedAt)) {
                    // If it's a string, try to parse it as a date
                    try {
                        $visitedAt = \Carbon\Carbon::parse($visitedAt)->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        // If parsing fails, keep the original string
                        Log::warning("Failed to parse visited_at date: {$visitedAt}");
                    }
                }
                
                $sheet->setCellValue("A{$row}", $visitedAt);
                $sheet->setCellValue("B{$row}", $visit->ip);
                $sheet->setCellValue("C{$row}", $visit->country);
                $sheet->setCellValue("D{$row}", $visit->city);
                $sheet->setCellValue("E{$row}", $visit->browser);
                $sheet->setCellValue("F{$row}", $visit->platform);
                $sheet->setCellValue("G{$row}", $visit->device_type);
                $sheet->setCellValue("H{$row}", $visit->screen_resolution);
                $sheet->setCellValue("I{$row}", $visit->referrer_url);
                $row++;
            }
            
            // Auto-size columns
            foreach (range('A', 'I') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }
            
            $filename = "analytics_{$link->code}_" . now()->format('Y-m-d_His') . '.xlsx';
            Log::info("Saving Excel file: {$filename}");
            
            // Ensure the exports directory exists
            $exportsPath = storage_path('app/exports');
            if (!file_exists($exportsPath)) {
                mkdir($exportsPath, 0755, true);
                Log::info("Created exports directory: {$exportsPath}");
            }
            
            $writer = new Xlsx($spreadsheet);
            $filePath = $exportsPath . '/' . $filename;
            $writer->save($filePath);
            Log::info("Excel file saved to: {$filePath}");
            
            // Verify the file exists
            if (file_exists($filePath)) {
                Log::info("File exists and is readable: {$filePath}");
            } else {
                Log::error("File does not exist after saving: {$filePath}");
                throw new \Exception("Failed to save Excel file");
            }
            
            return $filename;
        } catch (\Exception $e) {
            Log::error("Excel export failed for link ID: {$link->id}, error: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            throw $e;
        }
    }
    
    public function generateReport(Link $link)
    {
        $visits = $link->visits()->with('link')->get();
        
        $report = [
            'total_visits' => $visits->count(),
            'unique_visitors' => $visits->pluck('ip')->unique()->count(),
            'countries' => $visits->pluck('country')->unique()->values(),
            'browsers' => $visits->pluck('browser')->countBy(),
            'platforms' => $visits->pluck('platform')->countBy(),
            'device_types' => $visits->pluck('device_type')->countBy(),
            'peak_hours' => $this->calculatePeakHours($visits),
            'daily_stats' => $this->calculateDailyStats($visits),
            'referrers' => $visits->pluck('referrer_url')
                ->filter()
                ->countBy()
                ->sortDesc()
                ->take(10)
        ];
        
        return $report;
    }
    
    protected function calculatePeakHours($visits)
    {
        return $visits->groupBy(function ($visit) {
            return $visit->visited_at->format('H:00');
        })->map->count()->sortDesc();
    }
    
    protected function calculateDailyStats($visits)
    {
        return $visits->groupBy(function ($visit) {
            return $visit->visited_at->format('Y-m-d');
        })->map->count()->sortKeys();
    }
}
