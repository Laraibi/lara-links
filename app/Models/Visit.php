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
        'time_spent',
        'user_agent',
        'session_started_at',
        'session_ended_at',
        'additional_data'
    ];

    protected $casts = [
        'additional_data' => 'array',
        'session_started_at' => 'datetime',
        'session_ended_at' => 'datetime',
        'visited_at' => 'datetime'
    ];

    public function link()
    {
        return $this->belongsTo(Link::class);
    }
}
