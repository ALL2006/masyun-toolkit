import { db, defaultCategories } from '../db/database';
import { Category } from '../types';

export class CategoryService {
  // 获取所有分类
  async getAllCategories(): Promise<Category[]> {
    return await db.categories.toArray();
  }

  // 获取收入分类
  async getIncomeCategories(): Promise<Category[]> {
    return await db.categories.where('type').equals('income').toArray();
  }

  // 获取支出分类
  async getExpenseCategories(): Promise<Category[]> {
    return await db.categories.where('type').equals('expense').toArray();
  }

  // 根据ID获取分类
  async getCategoryById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  }

  // 添加自定义分类
  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    await db.categories.add(newCategory);
    return newCategory;
  }

  // 更新分类
  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await db.categories.update(id, updates);
  }

  // 删除分类
  async deleteCategory(id: string): Promise<void> {
    await db.categories.delete(id);
  }

  // 重置为默认分类
  async resetToDefault(): Promise<void> {
    await db.categories.clear();
    await db.categories.bulkAdd(defaultCategories);
  }
}

export const categoryService = new CategoryService();