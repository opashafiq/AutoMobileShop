"use client"
import React from "react";
import { TopCards } from "@/app/components/dashboards/modern/TopCards";
import { RevenueUpdate } from "@/app/components/dashboards/modern/RevenueUpdate";
import { YearlyBreakup } from "@/app/components/dashboards/modern/YearlyBreakup";
import { MonthlyEarning } from "@/app/components/dashboards/modern/MonthlyEarning";
import { EmployeeSalary } from "@/app/components/dashboards/modern/EmployeeSalary";
import { Customers } from "@/app/components/dashboards/modern/Customers";
import { Projects } from "@/app/components/dashboards/modern/Projects";
import { Social } from "@/app/components/dashboards/modern/Social";
import { SellingProducts } from "@/app/components/dashboards/modern/SellingProducts";
import { WeeklyStats } from "@/app/components/dashboards/modern/WeeklyStats";
import { TopPerformer } from "@/app/components/dashboards/modern/TopPerformer";

const ModernDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <TopCards />
        </div>
        <div className="lg:col-span-8 col-span-12">
          <RevenueUpdate />
        </div>
        <div className="lg:col-span-4 col-span-12 ">
          <div className="flex flex-col h-full gap-6">
            <YearlyBreakup />
            <MonthlyEarning />
          </div>
        </div>
        <div className="lg:col-span-4 col-span-12 ">
          <EmployeeSalary />
        </div>
        <div className="lg:col-span-4 col-span-12 ">
          <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="lg:col-span-6 col-span-12">
                <Customers />
              </div>
              <div className="lg:col-span-6 col-span-12">
                <Projects />
              </div>
            </div>
            <Social />
          </div>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <SellingProducts />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <WeeklyStats />
        </div>
        <div className="lg:col-span-8 col-span-12">
          <TopPerformer />
        </div>
      </div>

    </>
  );
};

export default ModernDashboard;
