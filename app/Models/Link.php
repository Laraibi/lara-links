<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User;
use App\Models\Visit;
use Illuminate\Support\Facades\Storage;

class Link extends Model
{
    protected $fillable = [
        'user_id',
        'original',
        'code',
        'name',
        'qr_code_path',
        'qr_code_enabled',
        'qr_code_style',
    ];

    protected $casts = [
        'qr_code_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function generateQrCode()
    {
        if (!$this->qr_code_enabled) {
            return null;
        }

        $url = url('/' . $this->code);
        
        // Create QR code using Endroid QR Code
        $qrCode = new \Endroid\QrCode\QrCode($url);
        $qrCode->setSize(300);
        $qrCode->setMargin(1);
        
        // Create writer
        $writer = new \Endroid\QrCode\Writer\PngWriter();
        
        // Generate QR code
        $result = $writer->write($qrCode);
        
        // Get the binary data
        $qrCodeBinary = $result->getString();

        $fileName = 'qr_' . $this->code . '.png';
        $path = 'qrcodes/' . $fileName;

        // Store the QR code in the public storage
        Storage::disk('public')->put($path, $qrCodeBinary);

        // Update the link with the QR code path
        $this->update([
            'qr_code_path' => $path
        ]);

        return $path;
    }

    public function getQrCodeUrl()
    {
        if (!$this->qr_code_path) {
            return null;
        }

        return asset('storage/' . $this->qr_code_path);
    }

    protected static function generateUniqueCode()
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $maxAttempts = 20; // Prevent infinite loop
        $attempt = 0;

        do {
            if ($attempt >= $maxAttempts) {
                throw new \Exception('Unable to generate unique code after ' . $maxAttempts . ' attempts');
            }

            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }

            $attempt++;
        } while (static::where('code', $code)->exists());

        return $code;
    }
} 