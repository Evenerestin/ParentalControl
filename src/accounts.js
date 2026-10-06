const { SID_ADMINS, BOM_PATTERN } = require("./constants");
const { PanelError } = require("./errors");
const {
	systemExe,
	run,
	runPowerShell,
	outputText,
	toArray,
} = require("./system");

const ACCOUNTS_SCRIPT = `
$users = @(Get-LocalUser | Where-Object Enabled | ForEach-Object { $_.Name })
$admins = @()
try {
  $admins = @(Get-LocalGroupMember -SID '${SID_ADMINS}' | ForEach-Object { ($_.Name -split '\\\\')[-1] })
} catch {
  try {
    $sid = New-Object System.Security.Principal.SecurityIdentifier('${SID_ADMINS}')
    $groupName = ($sid.Translate([System.Security.Principal.NTAccount]).Value -split '\\\\')[-1]
    $group = [ADSI]"WinNT://./$groupName,group"
    $admins = @($group.psbase.Invoke('Members') | ForEach-Object {
      $_.GetType().InvokeMember('Name', 'GetProperty', $null, $_, $null)
    })
  } catch {
    $admins = @()
  }
}
ConvertTo-Json -Compress -InputObject @{ users = $users; admins = $admins }
`;

const ELEVATION_SCRIPT = `
$p = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$p.IsInRole([Security.Principal.SecurityIdentifier]'${SID_ADMINS}')
`;

async function checkAdmin() {
	const res = await run(systemExe("net.exe"), ["session"]);
	if (res.code === 0) return true;
	const ps = await runPowerShell(ELEVATION_SCRIPT);
	return ps.code === 0 && ps.stdout.trim() === "True";
}

async function listAccounts() {
	const res = await runPowerShell(ACCOUNTS_SCRIPT);
	if (res.code !== 0) {
		throw new PanelError(
			`Nie udało się odczytać listy kont: ${outputText(res)}`,
		);
	}
	const data = JSON.parse(res.stdout.replace(BOM_PATTERN, "").trim());
	return {
		users: toArray(data.users).map(String),
		admins: toArray(data.admins).map(String),
	};
}

function sameName(a, b) {
	return a.toLowerCase() === b.toLowerCase();
}

function isAdminAccount(accounts, name) {
	return accounts.admins.some((a) => sameName(a, name));
}

function findAccount(accounts, name) {
	return accounts.users.find((u) => sameName(u, name));
}

module.exports = {
	checkAdmin,
	listAccounts,
	sameName,
	isAdminAccount,
	findAccount,
};
