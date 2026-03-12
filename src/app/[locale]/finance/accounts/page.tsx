"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import {
  getAccounts,
  deleteAccount,
  type Account,
  getTotalBalance,
} from "@/actions/accounts";
import { AddAccountDialog } from "@/features/add-account";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountsPage() {
  const t = useTranslations();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{
    id: string;
    name: string;
    currency: string;
    initialBalance: number;
    icon?: string;
    color?: string;
  } | null>(null);
  const [totalBalance, setTotalBalance] = useState<{
    total: number;
    byCurrency: Record<string, number>;
  }>({ total: 0, byCurrency: {} });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const [accs, balance] = await Promise.all([
        getAccounts(),
        getTotalBalance(),
      ]);
      setAccounts(accs);
      setTotalBalance(balance);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("finance.accounts.confirmDelete"))) return;
    try {
      const result = await deleteAccount(id);
      if (result.success) {
        await loadAccounts();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount({
      id: account.id,
      name: account.name,
      currency: account.currency,
      initialBalance: account.initialBalance,
      icon: account.icon,
      color: account.color,
    });
    setShowAddDialog(true);
  };

  const handleSuccess = () => {
    loadAccounts();
    setShowAddDialog(false);
    setEditingAccount(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t("finance.accounts.title")}
            </h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("finance.accounts.addAccount")}
          </Button>
        </div>

        {/* Total Balance */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium text-muted-foreground">
              {t("finance.accounts.totalBalance")}
            </div>
          </div>
          <div className="text-2xl font-bold">
            ${totalBalance.total.toFixed(2)}
          </div>
          {Object.entries(totalBalance.byCurrency).length > 1 && (
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              {Object.entries(totalBalance.byCurrency).map(
                ([currency, amount]) => (
                  <div key={currency}>
                    {currency}: {amount.toFixed(2)}
                  </div>
                ),
              )}
            </div>
          )}
        </GlassCard>

        {/* Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : accounts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {t("finance.accounts.noAccounts")}
            </div>
          ) : (
            accounts.map((account) => (
              <GlassCard
                key={account.id}
                className={cn(
                  "p-6 transition-colors hover:bg-muted/50",
                  "border-l-4",
                )}
                style={{
                  borderLeftColor: account.color || "#3b82f6",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{account.icon || "💰"}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {account.currency}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.accounts.initialBalance")}
                    </div>
                    <div className="font-medium">
                      {account.initialBalance.toFixed(2)} {account.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.accounts.currentBalance")}
                    </div>
                    <div
                      className={cn(
                        "font-bold text-lg",
                        account.balance >= 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {account.balance.toFixed(2)} {account.currency}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Account Dialog */}
      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
        editData={editingAccount}
      />
    </AppLayout>
  );
}
