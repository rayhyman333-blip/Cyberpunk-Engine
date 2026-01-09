  // 1. Your updated navItems array (Already mostly done in your screenshot)
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/deposit", label: "Wallet", icon: Wallet },
    { href: "/subscribe", label: "Activate Engine", icon: Zap }, // Ensure this matches exactly
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/payouts", label: "Payouts", icon: ShieldAlert });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-black/90 border-r border-white/10">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          GEO<span className="text-white">ENGINE</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          v2.0.4 <span className="text-primary animate-pulse">●</span> ONLINE
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
              >
                {/* 2. This part ensures the Zap icon glows yellow when it's the 'Activate Engine' button */}
                <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse" : "group-hover:text-primary"} ${item.label === "Activate Engine" && !isActive ? "text-yellow-500" : ""}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      {/* ... rest of your file remains the same */}

