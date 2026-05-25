<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\SlugGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->withCount('applications')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $data = $request->validated();
        $data['slug'] = SlugGenerator::unique($data['name'], Category::class);
        $data['active'] = $data['active'] ?? true;

        $category = Category::create($data);

        return new CategoryResource($category);
    }

    public function show(Category $category): CategoryResource
    {
        $category->loadCount('applications');

        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = SlugGenerator::unique($data['name'], Category::class, $category->id);
        }

        $category->update($data);

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->applications()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: tiene aplicaciones asociadas.',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Categoría eliminada.']);
    }

    public function toggleActive(Category $category): CategoryResource
    {
        $category->update(['active' => ! $category->active]);

        return new CategoryResource($category->fresh());
    }
}
