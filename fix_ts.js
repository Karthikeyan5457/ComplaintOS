const fs = require('fs');

function replace(file, search, replaceStr) {
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, content.replace(search, replaceStr));
}

replace('client/src/components/layout/Sidebar.tsx', 
    'Settings, LogOut, ChevronLeft, ChevronRight, Bell, Shield, Clock', 
    'LogOut, ChevronLeft, ChevronRight, Shield, Clock');

replace('client/src/pages/admin/UserManagementPage.tsx', 
    'import { Users, Search, Edit, Shield, ChevronLeft, ChevronRight, Trash2 }', 
    'import { Search, Edit, ChevronLeft, ChevronRight, Trash2 }');

replace('client/src/pages/auth/LoginPage.tsx', 
    'import { useNavigate, Link }', 
    'import { useNavigate }');

replace('client/src/pages/complaints/ComplaintDetailPage.tsx', 
    'History, Send, AlertTriangle, CheckCircle, User as UserIcon, Paperclip, RefreshCw,', 
    'History, Send, AlertTriangle, CheckCircle, User as UserIcon, RefreshCw,');

replace('client/src/pages/complaints/ComplaintListPage.tsx', 
    'const [categories, setCategories] = useState<Category[]>([]);', 
    '// @ts-ignore\n  const [categories, setCategories] = useState<Category[]>([]);');

replace('client/src/pages/dashboard/AdminDashboard.tsx', 
    "import { useAuth } from '../../contexts/AuthContext';", 
    '');

replace('client/src/pages/dashboard/AdminDashboard.tsx', 
    'XCircle, Zap, BarChart3, Target,', 
    'Zap, BarChart3, Target,');

replace('client/src/pages/dashboard/AdminDashboard.tsx', 
    'PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend,', 
    'PieChart, Pie, Cell, Area, AreaChart, Legend,');

console.log('Fixed');
