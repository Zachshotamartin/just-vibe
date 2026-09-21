# Cisco, BGP, VLAN and WireGuard operations

Use when: cisco ios, netmiko, bgp, vlan, wireguard, pihole, homelab.

Diagnose a named network path or prepare an authorized device change with a rollback route.

## Inspect first

- Topology, management path and out-of-band access
- Device/firmware, routing table, interfaces, ACLs and peer state
- Maintenance window, backup, intended diff and rollback timer

## Method

1. Start read-only: map source/destination, route selection, ARP/ND, interface errors, MTU and policy. Separate physical, L2, L3, DNS and application failures.
2. For BGP, inspect neighbor state, advertised/received prefixes, policy and next-hop reachability; do not reset all peers to diagnose one route.
3. For VLAN/WireGuard/Pi-hole, check both ends, allowed routes, DNS ownership and return traffic. Avoid overlapping address ranges and management lockout.
4. Use Netmiko or another installed device adapter only after verifying identity and the exact commands. Save pre-change config and validate offline before a bounded maintenance-window application.

## Failure cases

- An ACL or VLAN change removes the only management path.
- A broad allowed-IP route unintentionally sends all traffic through a tunnel.
- A DNS change creates a resolver loop.

## Verification

- Validate configuration syntax and expected route/interface invariants offline.
- Test reachability from both directions and verify management remains available.
- Record observed device state and rollback outcome; do not claim lab success proves production safety.

## Worked scenario

A BGP route exists but its next hop is unreachable: fix the underlay/policy instead of repeatedly resetting the neighbor.

## Version-sensitive primary references

- [www.cisco.com](https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.wireguard.com](https://www.wireguard.com/quickstart/) — Read the official source for the installed version before relying on a version-sensitive API.
- [docs.pi-hole.net](https://docs.pi-hole.net/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
