export const gallery = [
  {
    id: "processes",
    label: "Processes",
    title: "Find the process behind the problem.",
    description:
      "Switch between List, Tree and Apps. Search by name, PID, path or command line, choose a column layout, and inspect a process without chasing moving rows.",
    color: "cpu",
  },
  {
    id: "processes-light",
    label: "Light theme",
    title: "Your workspace. In a different light.",
    description:
      "The same process workspace in the application’s light theme. Choose the appearance, scale and table behavior that fit your display.",
    color: "cpu",
  },
  {
    id: "performance",
    label: "Performance",
    title: "See the whole system. Follow a single spike.",
    description:
      "CPU, memory, GPU, disk and network graphs in one workspace. Inspect a shared timeline, pin a moment, zoom in, or focus on one resource.",
    color: "memory",
  },
  {
    id: "overview",
    label: "Overview",
    title: "Your machine, at a glance.",
    description:
      "Resource gauges, busy applications, recent automatic actions and protection settings share one starting point.",
    color: "accent",
  },
  {
    id: "events",
    label: "Events",
    title: "Every decision has a trail.",
    description:
      "Filter by severity and search by process, PID or message. Open and copy full diagnostics before changing your protection settings.",
    color: "accent",
  },
  {
    id: "containers",
    label: "Containers",
    title: "Your local containers, in context.",
    description:
      "Read-only Docker monitoring with Compose filters, resource trends, health, port mappings and recent logs. Docker stays optional; remote contexts are not supported.",
    color: "network",
  },
  {
    id: "ports",
    label: "Ports",
    title: "Know what is listening.",
    description:
      "Connect listening ports to their programs, inspect reachability, and find familiar development services. Freeing a port ends its owning process and requires an explicit action.",
    color: "network",
  },
  {
    id: "disks",
    label: "Disks",
    title: "Follow the I/O. Find the space.",
    description:
      "Explore physical-disk activity and the busiest readers and writers. Analyze a drive or folder to inspect its largest files and directory sizes.",
    color: "disk",
  },
  {
    id: "services",
    label: "Services",
    title: "A closer look at what runs in the background.",
    description:
      "Inspect and sort Windows services, filter running or stopped entries, and use elevated controls for service actions and startup type.",
    color: "cpu",
  },
  {
    id: "limits",
    label: "App limits",
    title: "Give background work a budget.",
    description:
      "Set CPU and memory budgets shared by an application’s processes and descendants. Inspect configured limits and their current usage.",
    color: "memory",
  },
  {
    id: "sensors",
    label: "Sensors",
    title: "Read the hardware behind the workload.",
    description:
      "An optional hardware provider exposes supported temperatures, RPM, power, voltage and clocks. Cooling control depends on hardware support and per-device validation.",
    color: "disk",
  },
] as const;
