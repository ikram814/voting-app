import { 
  LayoutDashboard, 
  BarChart2, 
  ClipboardList, 
  PlusCircle, 
  CheckCircle, 
  Settings,
  LogOut,
  User,
  Users
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  console.log("Current path:", location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    
    <div className="
      fixed left-0 top-0
      w-64 h-screen
      bg-black 
      text-white 
      px-6 py-10 
      flex flex-col 
      gap-8
      shadow-xl
    ">
      
      {/* Title */}
      <h1 className="text-2xl font-bold pl-12"> Vote App</h1>

      {/* Profile dynamique avec image */}
      <div className="flex flex-col items-center text-center mb-7 -mt-2">
        <div className="
          w-28 h-28 
          rounded-full 
          overflow-hidden 
          bg-gradient-to-br from-amber-400 to-yellow-600 
          mb-4 
          border-4 border-yellow-500
          shadow-[0_0_25px_rgba(234,179,8,0.8),0_0_50px_rgba(234,179,8,0.5)]
          flex items-center justify-center
          hover:shadow-[0_0_35px_rgba(234,179,8,0.9),0_0_70px_rgba(234,179,8,0.7)]
          hover:scale-105
          transition-all duration-300
        ">
          {user?.image && !imageError ? (
            <img 
              src={user.image} 
              alt={user.username || "avatar"} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <User size={50} className="text-black/80" />
          )}
        </div>
        <h2 className="text-lg font-semibold">{user?.username || "User"}</h2>
        <p className="text-gray-400 text-sm">{user?.email || "user@example.com"}</p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-3 text-gray-300 -mt-9">  
        <SidebarItem 
          icon={<LayoutDashboard size={22} />} 
          text="Home" 
          onClick={() => navigate("/home")} 
          isActive={location.pathname === "/home"} 
        />
        <SidebarItem 
          icon={<BarChart2 size={22} />} 
          text="View Polls" 
          onClick={() => navigate("/view-polls")} 
          isActive={location.pathname === "/view-polls"} 
        />
        <SidebarItem 
          icon={<ClipboardList size={22} />} 
          text="My poll" 
          onClick={() => navigate("/MyPolls")} 
          isActive={location.pathname === "/MyPolls"} 
        />
        <SidebarItem 
          icon={<PlusCircle size={22} />} 
          text="Create polls" 
          onClick={() => navigate("/CreatePoll")} 
          isActive={location.pathname === "/CreatePoll"} 
        />
        {user?.isAdmin && (
          <SidebarItem 
            icon={<Users size={22} />} 
            text="Rooms" 
            onClick={() => navigate("/rooms")} 
            isActive={location.pathname === "/rooms" || location.pathname.startsWith("/rooms/")} 
          />
        )}
        {!user?.isAdmin && (
          <SidebarItem 
            icon={<Users size={22} />} 
            text="My Rooms" 
            onClick={() => navigate("/rooms")} 
            isActive={location.pathname === "/rooms" || location.pathname.startsWith("/rooms/")} 
          />
        )}
        <SidebarItem 
          icon={<CheckCircle size={22} />} 
          text="Notifications" 
          onClick={() => navigate("/votedPolls")} 
          isActive={location.pathname === "/votedPolls"} 
        />
        <SidebarItem 
          icon={<Settings size={22} />} 
          text="Profile" 
          onClick={() => navigate("/Profile")} 
          isActive={location.pathname === "/profile"} 
        />

        <div className="mt-14">
          <SidebarItem 
            icon={<LogOut size={22} />} 
            text="Logout" 
            onClick={handleLogout} 
            isActive={false}
          />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, onClick, isActive = false }) {
  // DEBUG
  console.log(`${text} - isActive:`, isActive);
  
  return (
    <div
      onClick={onClick}
      className={`
        group
        flex items-center gap-4
        cursor-pointer 
        py-2 px-3
        rounded-xl
        border border-transparent
        transition-all duration-300 ease-out
        ${isActive 
          ? 'bg-amber-400 text-black scale-105 shadow-[0_4px_15px_rgba(255,215,0,0.6)]' 
          : 'text-white hover:bg-amber-400 hover:text-black hover:scale-105 hover:shadow-[0_4px_15px_rgba(255,215,0,0.6)]'
        }
      `}
    >
      <span className={`
        transition-all duration-300
        ${isActive ? 'text-black' : 'text-amber-400 group-hover:text-black'}
      `}>
        {icon}
      </span>

      <span className="text-base font-medium">
        {text}
      </span>
    </div>
  );
}