<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Centro de Aplicaciones TIC</title>
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="antialiased">
    <div id="root"></div>
</body>
</html>
