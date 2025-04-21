<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CheckExportsDirectory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exports:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and fix the exports directory permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking exports directory...');
        
        $exportsPath = storage_path('app/exports');
        
        // Check if directory exists
        if (!file_exists($exportsPath)) {
            $this->info('Exports directory does not exist. Creating it...');
            mkdir($exportsPath, 0755, true);
            $this->info('Exports directory created successfully.');
        } else {
            $this->info('Exports directory exists.');
        }
        
        // Check permissions
        $permissions = substr(sprintf('%o', fileperms($exportsPath)), -4);
        $this->info("Current permissions: {$permissions}");
        
        // Set proper permissions
        chmod($exportsPath, 0755);
        $this->info('Permissions set to 0755.');
        
        // Check if directory is writable
        if (is_writable($exportsPath)) {
            $this->info('Directory is writable.');
        } else {
            $this->error('Directory is not writable!');
            $this->info('Attempting to fix permissions...');
            chmod($exportsPath, 0777);
            $this->info('Permissions set to 0777.');
        }
        
        // Test file creation
        $testFile = $exportsPath . '/test.txt';
        if (file_put_contents($testFile, 'test')) {
            $this->info('Successfully created test file.');
            unlink($testFile);
            $this->info('Test file removed.');
        } else {
            $this->error('Failed to create test file!');
        }
        
        $this->info('Exports directory check completed.');
        
        return 0;
    }
} 