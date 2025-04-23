<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Link;

class Visit extends Model
{
    //
    protected $fillable = [
        'link_id',
        'ip',
        'device',
        'language',
        'visited_at',
        'country',
        'city',
        'browser',
        'browser_version',
        'platform',
        'platform_version',
        'device_type',
        'screen_resolution',
        'referrer_url',
        'user_agent',
        'additional_data'
    ];

    protected $casts = [
        'visited_at' => 'datetime',
        'additional_data' => 'array'
    ];

    public function link()
    {
        return $this->belongsTo(Link::class);
    }
}
