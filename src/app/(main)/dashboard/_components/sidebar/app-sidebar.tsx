"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { useAuth } from "@/contexts/auth-context";
import { getSidebarItemsForRole } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const filteredItems = getSidebarItemsForRole(user?.role);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pt-10 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto hover:bg-transparent active:bg-transparent">
              <a href="#" className="flex flex-col items-center justify-center gap-3">
                <div className="flex flex-col items-center justify-center font-black tracking-normal select-none">
                  <span className="text-[2.25rem] leading-none text-[#3b46c2] group-data-[collapsible=icon]:text-[1.5rem]">
                    SQ
                  </span>
                  <span className="mt-2 text-[2.25rem] leading-none text-[#ff6a00] group-data-[collapsible=icon]:mt-1 group-data-[collapsible=icon]:text-[1.5rem]">
                    FT
                  </span>
                </div>
                <span className="text-center text-lg leading-tight font-bold group-data-[collapsible=icon]:hidden">
                  {APP_CONFIG.name}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={rootUser} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
