<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\link;

class Visit extends Model
{
    //
    protected $fillable = [
        'link_id',
        "ip",
        'device',
        'language',
        'visited_at',
        'country',
        'city',
    ];

    public function link()
    {
        return $this->belongsTo(link::class);
    }
}
