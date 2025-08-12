import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { TASK_STATUS_CLASS_MAP, TASK_STATUS_TEXT_MAP } from "@/constants";
import { Head, Link, router } from "@inertiajs/react";
import PhishingForm from "@/Components/PhishingForm"; 
import SentEmailsTable from "@/Components/SentEmailsTable";
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
export default function Dashboard({
    
  emails: initialEmails,
  auth,
 
}) {
  
  const [emails, setEmails] = useState(initialEmails);

  const handleEmailCreated = async () => {
  window.location.reload();
  };
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

        
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
           <SentEmailsTable emails={emails} />

          <PhishingForm onEmailSent={handleEmailCreated} />
        </div>
        

      
    </AuthenticatedLayout>
  );
}
