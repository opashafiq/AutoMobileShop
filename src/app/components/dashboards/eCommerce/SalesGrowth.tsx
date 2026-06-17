"use client"

import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Icon } from "@iconify/react/dist/iconify.js";

export const SalesGrowth = () => {

    const ChartData: any = {
        series: [
            {
                name: "Sales",
                colors: ["var(--color-primary)"],
                data: [0, 10, 10, 10, 35, 45, 30, 30, 30, 50, 52, 30, 25, 45, 50, 80, 60, 65]
            },
        ],
        chart: {
            id: "growth",
            type: "area",
            height: 25,
            sparkline: {
                enabled: true,
            },
            group: "growth",
            fontFamily: "inherit",
            foreColor: "#adb0bb",
        },
        stroke: {
            curve: "smooth",
            width: 2,
        },
        fill: {
            colors: ["var(--color-secondary)"],
            opacity: 0,
            type: "gradient",
            gradient: {
                shadeIntensity: 0,
                inverseColors: false,
                opacityFrom: 0,
                opacityTo: 0,
                stops: [20, 280],
            },
        },

        markers: {
            size: 0,
        },
        tooltip: {
            theme: "dark",
            fillSeriesColor: false,
            y: {
                formatter: function (value: number) {
                    return `$${value.toLocaleString()}K`;
                }
            }
        },
    };

    return (
        <>
            <Card className="h-full">
                <div className="flex flex-col gap-4">
                    <div className="flex 2xl:flex-row lg:flex-col-reverse flex-row 2xl:items-center lg:items-start items-center justify-between">
                        <div>
                            <h3 className="text-lg">
                                $16.5k
                            </h3>
                            <p className=" mt-1">Growth</p>
                        </div>
                        <div className="p-2 bg-lightsecondary dark:bg-lightsecondary rounded-md flex justify-center items-center text-secondary">
                            <Icon icon="solar:chart-2-bold-duotone" className='text-2xl' />
                        </div>
                    </div>
                    <div>
                        <Chart
                            options={ChartData}
                            series={ChartData.series}
                            type="area"
                            width={"100%"}
                            height={"100px"}
                        />
                    </div>
                </div>
            </Card >
        </>
    )
}
