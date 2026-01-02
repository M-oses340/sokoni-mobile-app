import { Outlet } from "react-router";
function DashboardLayout(){
    return(
        <div>
            sidebar
            navbar
            <Outlet/>
        </div>
    )
}


export default DashboardLayout;