import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import Page3 from "@/pages/Page3";
import Page4 from "@/pages/Page4";
import Page5 from "@/pages/Page5";
import Page6 from "@/pages/Page6";
import Page7 from "@/pages/Page7";
import Page8 from "@/pages/Page8";
import Page9 from "@/pages/Page9";
import Page10 from "@/pages/Page10";
import ErrorBoundary from "@/components/ErrorBoundary";
import SystemDiagnostics from "@/components/SystemDiagnostics";
import TrialBalancePage from "@/pages/TrialBalancePage";
import FinancialStatementsPage from "@/pages/FinancialStatementsPage";
import IncomeStatementPage from "@/pages/IncomeStatementPage";
import BalanceSheetPage from "@/pages/BalanceSheetPage";
import CashFlowStatementPage from "@/pages/CashFlowStatementPage";
import EquityChangesStatementPage from "@/pages/EquityChangesStatementPage";
import NotesDisclosurePage from "@/pages/NotesDisclosurePage";
import FinancialManagementLevel1 from "@/pages/FinancialManagementLevel1";
import FinancialManagementLevel2 from "@/pages/FinancialManagementLevel2";
import LibraryPage from "@/pages/LibraryPage";
import PathsPage from "@/pages/PathsPage";

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App: بدء تشغيل التطبيق');
  console.log('🌐 App: الرابط الحالي:', window.location.href);
  console.log('📱 App: معلومات المتصفح:', navigator.userAgent);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SystemDiagnostics />
            <BrowserRouter>
                <Routes>
                   <Route path="/auth" element={<AuthPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                  <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                  
                  {/* Public Routes - No authentication required */}
                  <Route path="/" element={<Index />} />
                <Route path="/page3" element={<Page3 />} />
                <Route path="/page4" element={<Page4 />} />
                <Route path="/page5" element={<Page5 />} />
                <Route path="/page6" element={<Page6 />} />
                <Route path="/page7" element={<Page7 />} />
                <Route path="/page8" element={<Page8 />} />
                <Route path="/page9" element={<Page9 />} />
                <Route path="/page10" element={<Page10 />} />

                {/* صفحات المستوى الثالث */}
                <Route path="/trial-balance" element={<TrialBalancePage />} />
                <Route path="/financial-statements" element={<FinancialStatementsPage />} />
                <Route path="/financial-statements/income" element={<IncomeStatementPage />} />
                <Route path="/financial-statements/balance-sheet" element={<BalanceSheetPage />} />
                <Route path="/financial-statements/cash-flow" element={<CashFlowStatementPage />} />
                <Route path="/financial-statements/equity-changes" element={<EquityChangesStatementPage />} />
                <Route path="/financial-statements/notes" element={<NotesDisclosurePage />} />

                {/* صفحات المستوى المتقدم للإدارة المالية */}
                <Route path="/financial-management-level-1" element={<FinancialManagementLevel1 />} />
                <Route path="/financial-management-level-2" element={<FinancialManagementLevel2 />} />

                {/* صفحة المكتبة */}
                <Route path="/library" element={<LibraryPage />} />

                {/* صفحة المسارات */}
                <Route path="/paths" element={<PathsPage />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
