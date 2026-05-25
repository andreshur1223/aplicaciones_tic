<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@local.test'],
            [
                'name' => 'Administrador TIC',
                'password' => Hash::make('Admin12345*'),
                'role' => 'admin',
                'active' => true,
            ]
        );
    }
}
