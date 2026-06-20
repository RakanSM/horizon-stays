'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Expense, ExpenseTab } from '@/types';

export function useExpenses(tab?: ExpenseTab) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['expenses', tab],
    queryFn: async (): Promise<Expense[]> => {
      let query = supabase
        .from('expenses')
        .select('*, property:properties(internal_name)')
        .order('expense_date', { ascending: false });
      if (tab) query = query.eq('tab', tab);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
