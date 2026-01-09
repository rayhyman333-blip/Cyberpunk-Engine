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
                {/* Updated Icon logic to handle the new Zap icon and add a yellow glow */}
                <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse" : "group-hover:text-primary"} ${item.label === "Activate Engine" ? "text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]" : ""}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{user?.username}</span>
            <span className="text-xs text-primary font-mono">
              ${((user?.balance || 0) / 100).toFixed(2)}
            </span>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/40"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    </div>
  );


