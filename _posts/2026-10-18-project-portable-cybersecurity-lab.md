---
title: "Project: Portable Cybersecurity Lab"
date: 2026-10-19
description: >-
  Hardware: Raspberry Pi 5

  Operating System: Raspberry Pi OS Lite (64-bit)

  Technologies: Linux, Python, FastAPI, React, TypeScript, Nmap, TShark, tcpdump, WireGuard, SQLite, Docker, and Caddy

  Difficulty: Intermediate–Advanced

  Estimated Build Time: 1–2 weeks for an MVP
---
# Portable Cybersecurity Lab — Turning a Raspberry Pi 5 Into a Network Security Workstation

## Introduction

What if you could carry an entire cybersecurity workstation in your pocket?

In this project, we're transforming a Raspberry Pi 5 into a portable cybersecurity appliance capable of discovering network devices, scanning ports, analyzing network traffic, monitoring infrastructure, and securely connecting to a remote homelab.

Instead of relying on multiple applications and command-line interfaces, we're developing a custom web dashboard that brings these capabilities together.

The goal isn't simply to install Kali Linux tools on a Raspberry Pi. It's to understand how networking, cybersecurity, Linux administration, VPNs, backend engineering, and monitoring systems work together.

This project also serves as a foundation for future development of **NetAssist**, a networking and infrastructure management platform.

---

# 1. Hardware Requirements

| Component | Purpose |
|---|---|
| Raspberry Pi 5 | Main cybersecurity workstation |
| 32GB+ microSD card or SSD | Operating system and storage |
| Raspberry Pi power supply | Reliable power |
| Ethernet cable | Wired network connectivity |
| MacBook or laptop | Remote administration |
| Router or isolated test network | Authorized network testing |

Optional accessories include a portable power bank, case, active cooler, and compatible USB Wi-Fi adapter.

The Raspberry Pi's built-in Wi-Fi is sufficient for ordinary connectivity. Specialized wireless monitoring may require a compatible external adapter.

---

# 2. System Architecture

```text
                  USER DEVICES
             MacBook / iPhone / iPad
                       |
                 HTTPS / VPN
                       |
                WEB DASHBOARD
                React + Vite
                       |
                  FastAPI
                       |
               RASPBERRY PI 5
                       |
       +---------------+---------------+
       |               |               |
   NETWORKING       SECURITY       MONITORING
       |               |               |
      Ping            Nmap          CPU / RAM
   Traceroute        TShark        Temperature
   DNS Lookup        tcpdump       Network Stats
     iPerf3        Vulnerability     Logs
       |            Analysis           |
       +---------------+---------------+
                       |
                   WireGuard
                       |
                  HOME LAB
                       |
       +---------------+---------------+
       |               |               |
   Ubuntu Server   Windows Server   Fedora
```

The Raspberry Pi acts as a centralized interface for network diagnostics and security monitoring.

All scanning and packet capture should be performed only on networks and systems you own or are explicitly authorized to assess.

---

# 3. Phase 1 — Raspberry Pi Installation and Configuration

## Step 1: Install Raspberry Pi OS

Download Raspberry Pi Imager:

https://www.raspberrypi.com/software/

Select:

```text
Device: Raspberry Pi 5
OS: Raspberry Pi OS Lite (64-bit)
Storage: microSD / SSD
```

Configure the following settings in Raspberry Pi Imager:

```text
Hostname: cyberpi
Username: yourusername
SSH: Enabled
Authentication: Public Key (recommended)
```

Configure Wi-Fi if Ethernet is unavailable.

For the initial setup, use a trusted local network.

## Step 2: Connect Through SSH

From your MacBook terminal:

```bash
ssh yourusername@cyberpi.local
```

Replace `yourusername` with your configured Linux username.

Verify the operating system:

```bash
cat /etc/os-release
```

Check hardware information:

```bash
uname -a
```

Check the Raspberry Pi model:

```bash
cat /proc/device-tree/model
```

## Step 3: Update the System

```bash
sudo apt update
sudo apt full-upgrade -y
sudo reboot
```

Reconnect after reboot.

## Step 4: Install Essential Cybersecurity Tools

```bash
sudo apt install -y \
  nmap \
  tcpdump \
  tshark \
  traceroute \
  dnsutils \
  iperf3 \
  curl \
  wget \
  git \
  python3 \
  python3-pip \
  python3-venv \
  wireguard \
  jq \
  htop \
  sqlite3 \
  ufw
```

During installation, TShark may ask whether non-root users should be allowed to capture packets.

For the initial setup, keep packet capture restricted to privileged users. We can configure narrowly scoped permissions later.

Verify installations:

```bash
nmap --version
```

```bash
tshark --version
```

```bash
wg --version
```

```bash
python3 --version
```

---

# 4. Phase 2 — Network Discovery and Scanning

Network scanning is one of the fundamental skills in cybersecurity.

It helps identify active hosts, exposed services, and potential configuration issues.

We'll use **Nmap**, an open-source network discovery and security auditing tool.

## Identify Your Network

Display network interfaces:

```bash
ip -br addr
```

View routing information:

```bash
ip route
```

Identify the default gateway:

```bash
ip route show default
```

Example lab network:

```text
Raspberry Pi: 192.168.50.10
Gateway:      192.168.50.1
Subnet:       192.168.50.0/24
```

The addresses below are examples. Replace them with your actual authorized lab network.

## Discover Active Devices

```bash
sudo nmap -sn 192.168.50.0/24
```

This performs host discovery without a port scan.

Example output:

```text
Nmap scan report for 192.168.50.1
Host is up.

Nmap scan report for 192.168.50.10
Host is up.

Nmap scan report for 192.168.50.20
Host is up.
```

## Scan Open Ports

```bash
nmap -sT 192.168.50.20
```

## Identify Services

```bash
nmap -sV 192.168.50.20
```

Example:

```text
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH
80/tcp   open  http    nginx
443/tcp  open  https   nginx
```

## Operating System Detection

```bash
sudo nmap -O 192.168.50.20
```

OS detection is an estimate and may be inaccurate.

## Export Scan Results

```bash
mkdir -p ~/cyberpi/scans

nmap -sV \
  -oX ~/cyberpi/scans/scan.xml \
  192.168.50.20
```

These results will later be integrated into our dashboard.

---

# 5. Phase 3 — Network Diagnostics

Next, we'll build a collection of network troubleshooting tools.

These will help diagnose connectivity problems, DNS issues, routing failures, and performance bottlenecks.

## Ping

```bash
ping -c 5 192.168.50.1
```

Ping measures round-trip latency and packet loss.

## Traceroute

```bash
traceroute 1.1.1.1
```

Traceroute helps identify the network path between devices.

Some routers may not respond to traceroute probes.

## DNS Lookup

```bash
dig example.com
```

Query a specific DNS server:

```bash
dig @1.1.1.1 example.com
```

Check DNS records:

```bash
dig example.com MX
```

```bash
dig example.com NS
```

## TCP Connectivity

```bash
nc -vz 192.168.50.20 22
```

This checks whether TCP port 22 is reachable.

If `nc` is unavailable:

```bash
sudo apt install netcat-openbsd
```

## Bandwidth Testing

On another computer in your lab:

```bash
iperf3 -s
```

On the Raspberry Pi:

```bash
iperf3 -c 192.168.50.20
```

Replace the IP with the machine running the iPerf3 server.

This measures network throughput between the two systems.

---

# 6. Phase 4 — Packet Capture and Analysis

Packet analysis helps us understand what is happening inside a network.

We'll use two tools:

**tcpdump:** Captures network packets.

**TShark:** Analyzes packets from the command line using Wireshark's protocol dissectors.

## Identify Network Interfaces

```bash
ip -br link
```

Typical interfaces:

```text
eth0
wlan0
lo
```

## Capture Network Traffic

Capture 100 packets from the Raspberry Pi's Ethernet interface:

```bash
sudo tcpdump -i eth0 -c 100
```

Save packets to a PCAP file:

```bash
mkdir -p ~/cyberpi/captures

sudo tcpdump -i eth0 \
  -c 100 \
  -w ~/cyberpi/captures/network.pcap
```

This captures traffic visible to that interface, not automatically every packet transmitted across the network.

## Analyze Captured Packets

```bash
tshark -r ~/cyberpi/captures/network.pcap
```

Filter DNS traffic:

```bash
tshark -r ~/cyberpi/captures/network.pcap \
  -Y "dns"
```

Filter TCP traffic:

```bash
tshark -r ~/cyberpi/captures/network.pcap \
  -Y "tcp"
```

Filter HTTP traffic:

```bash
tshark -r ~/cyberpi/captures/network.pcap \
  -Y "http"
```

Display protocol statistics:

```bash
tshark -r ~/cyberpi/captures/network.pcap \
  -q -z io,phs
```

## Transfer Captures to Your MacBook

Run this command on your MacBook:

```bash
scp yourusername@cyberpi.local:~/cyberpi/captures/network.pcap .
```

Open the downloaded file using Wireshark.

**What we'll learn:** TCP/IP, DNS, packet structure, protocol analysis, encryption, and network troubleshooting.

---

# 7. Phase 5 — WireGuard VPN Integration

One of the most useful features of this project is secure remote access.

We'll configure the Raspberry Pi as a WireGuard peer so it can communicate with our existing homelab.

## Install WireGuard

Already installed during Phase 1, but verify:

```bash
wg --version
```

## Generate Keys

```bash
sudo install -d -m 700 /etc/wireguard

sudo sh -c 'umask 077; wg genkey > /etc/wireguard/privatekey'

sudo sh -c 'wg pubkey < /etc/wireguard/privatekey > /etc/wireguard/publickey'
```

Display the public key:

```bash
sudo cat /etc/wireguard/publickey
```

**Never publish your private key.**

## Example WireGuard Configuration

Your existing Ubuntu WireGuard hub uses:

```text
Ubuntu Hub: 10.1.2.11
WireGuard Port: 51820
```

We can provision a new peer for the Raspberry Pi, using an unused tunnel address such as `10.1.2.14`.

Example configuration:

```ini
[Interface]
Address = 10.1.2.14/32
PrivateKey = <RASPBERRY_PI_PRIVATE_KEY>

[Peer]
PublicKey = <UBUNTU_HUB_PUBLIC_KEY>
Endpoint = <YOUR_REACHABLE_HUB_ENDPOINT>:51820
AllowedIPs = 10.1.2.0/24
PersistentKeepalive = 25
```

Save the configuration to:

```text
/etc/wireguard/wg0.conf
```

Set permissions:

```bash
sudo chmod 600 /etc/wireguard/wg0.conf
```

The Ubuntu hub must also have a peer entry for the Raspberry Pi's public key and tunnel address. The endpoint must be reachable from the Pi's current network.

## Start WireGuard

```bash
sudo wg-quick up wg0
```

Check status:

```bash
sudo wg show
```

Test connectivity:

```bash
ping -c 4 10.1.2.11
```

Once verified, enable automatic startup:

```bash
sudo systemctl enable wg-quick@wg0
```

Now the Raspberry Pi can communicate with authorized systems through the VPN, subject to routing and firewall rules.

---

# 8. Phase 6 — Build the FastAPI Backend

We'll build a Python backend that provides system information and controlled network diagnostics to the dashboard.

## Create the Project

```bash
mkdir -p ~/cyberpi/backend
cd ~/cyberpi/backend
```

Create a Python virtual environment:

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install \
  fastapi \
  "uvicorn[standard]" \
  psutil \
  pydantic
```

## Create the API

Create `main.py`:

```python
from fastapi import FastAPI
import psutil
import subprocess

app = FastAPI(
    title="CyberPi API",
    version="1.0.0"
)

@app.get("/health")
def health():
    return {"status": "online"}

@app.get("/system")
def system_info():
    temperature = None

    try:
        result = subprocess.run(
            ["vcgencmd", "measure_temp"],
            capture_output=True,
            text=True,
            timeout=3,
            check=True
        )
        temperature = result.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        pass

    return {
        "cpu": psutil.cpu_percent(interval=0.1),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage("/").percent,
        "temperature": temperature
    }
```

This is an initial local development API, not the complete authenticated security dashboard.

## Start the Backend

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

Test it on the Raspberry Pi:

```bash
curl http://127.0.0.1:8000/health
```

Example response:

```json
{
  "status": "online"
}
```

Check system metrics:

```bash
curl http://127.0.0.1:8000/system
```

The next development step is adding authenticated endpoints for approved scanning and diagnostic operations.

We'll use validated target addresses, allowlisted commands, execution timeouts, and audit logs rather than accepting arbitrary shell commands from the dashboard.

---

# 9. Phase 7 — React Dashboard

The frontend will provide a centralized interface for the Raspberry Pi.

## Install Node.js

Use a supported Node.js LTS release compatible with your Vite version.

Verify installation:

```bash
node --version
npm --version
```

## Create the Frontend

```bash
cd ~/cyberpi

npm create vite@latest frontend -- \
  --template react-ts
```

Install dependencies:

```bash
cd frontend

npm install
```

Install useful libraries:

```bash
npm install \
  axios \
  @tanstack/react-query \
  lucide-react \
  recharts \
  react-router-dom
```

## Dashboard Features

The dashboard will contain:

| Page | Features |
|---|---|
| Overview | CPU, RAM, temperature, network status |
| Network Scanner | Device discovery and port scanning |
| Diagnostics | Ping, traceroute, DNS, bandwidth tests |
| Packet Analyzer | Packet captures and protocol statistics |
| VPN | WireGuard status and tunnel information |
| Reports | Scan history and downloadable reports |
| Settings | Authentication and configuration |

### Design Language

```text
Background:  #09090B
Cards:       #18181B
Borders:     #27272A
Accent:      #22C55E
Text:        #FAFAFA
Secondary:   #A1A1AA
```

We'll use Tailwind CSS to build a responsive interface suitable for laptops, tablets, and phones.

---

# 10. Phase 8 — Monitoring and Logging

We'll collect system and network metrics to understand the Raspberry Pi's performance.

## CPU and Memory

```bash
htop
```

## Storage

```bash
df -h
```

## Temperature

```bash
vcgencmd measure_temp
```

## Network Statistics

```bash
ip -s link
```

## System Logs

```bash
journalctl -p warning -n 50
```

## WireGuard Status

```bash
sudo wg show
```

Later, these metrics will be stored in SQLite and visualized using charts.

We'll also implement:

- Scan history
- Network device inventory
- Scheduled connectivity checks
- System performance history
- Security activity logs
- Alerts for unavailable devices

---

# 11. Phase 9 — Authentication and Security

Because the dashboard can initiate network operations, securing it is essential.

We'll implement:

- Authenticated dashboard access
- Protected API endpoints
- Server-side target validation
- Approved network ranges
- Restricted packet capture permissions
- Command execution timeouts
- API rate limiting
- Audit logging
- HTTPS access
- Secure credential storage

For remote access, we'll use WireGuard rather than exposing the dashboard directly to the public internet.

A reverse proxy such as Caddy can provide HTTPS. Authentication and access controls must be implemented before allowing access from other devices.

---

# 12. Phase 10 — Deployment

Once the backend and frontend are complete, we'll configure automatic startup.

## Example Backend Service

Create:

```bash
sudo nano /etc/systemd/system/cyberpi-api.service
```

Example configuration:

```ini
[Unit]
Description=CyberPi FastAPI Backend
After=network.target

[Service]
User=yourusername
WorkingDirectory=/home/yourusername/cyberpi/backend
ExecStart=/home/yourusername/cyberpi/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=on-failure
RestartSec=5
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

Replace `yourusername` with your actual Linux username.

Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cyberpi-api
```

Check status:

```bash
sudo systemctl status cyberpi-api
```

The service runs the API on localhost. A separate authenticated HTTPS reverse proxy will be required for dashboard access from other devices.

---

# 13. Phase 11 — Reports and Automation

We'll integrate the cybersecurity lab with an existing n8n automation server.

Possible workflows include:

**Network Monitoring**

```text
Scheduled Check
      |
      v
Connectivity Test
      |
      v
Store Results
      |
      v
Detect Failure
      |
      v
Send Notification
```

**Network Inventory**

```text
Authorized Nmap Scan
        |
        v
Parse Results
        |
        v
Update SQLite
        |
        v
Generate Report
```

**Security Monitoring**

```text
Security Event
      |
      v
Event Classification
      |
      v
Store Audit Record
      |
      v
Send Alert
```

All scheduled scans will use explicitly approved targets.

---

# 14. Final Testing

Before calling the project complete, we'll verify:

| Test | Expected Result |
|---|---|
| Raspberry Pi reboot | Required services restart |
| SSH access | Secure remote administration works |
| Network discovery | Authorized devices are discovered |
| Port scanning | Open services are identified |
| DNS diagnostics | DNS queries return valid responses |
| Packet capture | PCAP files are generated |
| WireGuard | Homelab connectivity works |
| Dashboard | Responsive interface loads |
| Authentication | Unauthorized access is rejected |
| Monitoring | System metrics are accurate |
| Reports | Results can be exported |
| Logging | Security events are recorded |

We'll also verify that failed scans, unreachable hosts, invalid inputs, and disconnected VPN tunnels are handled correctly.

---

# 15. What This Project Teaches

This project covers several important areas of computer science and cybersecurity.

**Networking:** TCP/IP, DNS, routing, ports, services, network discovery, and packet analysis.

**Linux:** System administration, SSH, systemd, permissions, processes, and troubleshooting.

**Cybersecurity:** Network reconnaissance, traffic analysis, vulnerability assessment, authentication, encryption, and security monitoring.

**Software Engineering:** Python, REST APIs, FastAPI, React, TypeScript, SQLite, and frontend/backend integration.

**Infrastructure:** VPNs, reverse proxies, monitoring, automation, and service deployment.

---

# Conclusion

The Portable Cybersecurity Lab is more than a collection of security tools installed on a Raspberry Pi.

It's an opportunity to understand how networking, operating systems, security tools, APIs, databases, and infrastructure work together.

By the end of the project, the goal is to have a portable network security appliance capable of performing authorized network assessments, analyzing traffic, monitoring systems, generating reports, and securely connecting to a remote homelab.

**Project status:** Development guide and planned implementation. The commands above cover the initial setup and demonstrations; the complete authenticated dashboard, automation, and deployment still require implementation.

**Future improvements:** Network topology visualization, IDS integration, vulnerability correlation, advanced analytics, and integration with NetAssist.

**GitHub:** Add your repository URL here  
**Portfolio:** https://www.vishnumoguluri.com

*Disclaimer: This project is intended for cybersecurity education, network administration, and authorized security testing. Only scan or capture traffic on systems and networks you own or have explicit permission to assess.*
