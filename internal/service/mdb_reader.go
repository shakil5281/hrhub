package service

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

type ZKPunchRecord struct {
	UserID      int    `json:"user_id"`
	BadgeNumber string `json:"badge_number"`
	Name        string `json:"name"`
	PunchTime   string `json:"punch_time"`
	PunchType   string `json:"punch_type"`
	DeviceID    int    `json:"device_id"`
	DeviceSN    string `json:"device_sn"`
}

func (r *ZKPunchRecord) PunchTimeParsed() time.Time {
	t, err := time.Parse("2006-01-02T15:04:05", r.PunchTime[:19])
	if err != nil {
		return time.Time{}
	}
	return t
}

type MDBReader struct {
	DefaultPath string
}

func NewMDBReader() *MDBReader {
	return &MDBReader{
		DefaultPath: `C:\Program Files (x86)\ZKTeco\att2000.mdb`,
	}
}

func (r *MDBReader) ReadPunches(filePath string, startDate, endDate string) ([]ZKPunchRecord, error) {
	filePath = strings.ReplaceAll(filePath, "'", "''")

	dateFilter := ""
	if startDate != "" && endDate != "" {
		dateFilter = fmt.Sprintf(" WHERE CHECKTIME >= #%s 00:00:00# AND CHECKTIME <= #%s 23:59:59#", startDate, endDate)
	} else if startDate != "" {
		dateFilter = fmt.Sprintf(" WHERE CHECKTIME >= #%s 00:00:00#", startDate)
	} else if endDate != "" {
		dateFilter = fmt.Sprintf(" WHERE CHECKTIME <= #%s 23:59:59#", endDate)
	}

	psScript := fmt.Sprintf(`
$conn = New-Object -ComObject ADODB.Connection
try {
  $conn.Open("Provider=Microsoft.ACE.OLEDB.12.0;Data Source='%s'")
  $empRs = $conn.Execute("SELECT USERID, Badgenumber, Name FROM USERINFO")
  $empMap = @{}
  while (-not $empRs.EOF) {
    $empMap[[int]$empRs.Fields.Item("USERID").Value] = @{
      Badgenumber = [string]$empRs.Fields.Item("Badgenumber").Value
      Name = [string]$empRs.Fields.Item("Name").Value
    }
    $empRs.MoveNext()
  }
  $rs = $conn.Execute("SELECT USERID, CHECKTIME, CHECKTYPE, SENSORID, sn FROM CHECKINOUT%s ORDER BY USERID, CHECKTIME")
  $result = New-Object System.Collections.ArrayList
  while (-not $rs.EOF) {
    $uid = [int]$rs.Fields.Item("USERID").Value
    $emp = $empMap[$uid]
    $bno = ""
    $ename = ""
    if ($emp -ne $null) { $bno = $emp.Badgenumber; $ename = $emp.Name }
    [void]$result.Add(@{
      user_id = $uid
      badge_number = $bno
      name = $ename
      punch_time = $rs.Fields.Item("CHECKTIME").Value.ToString("o")
      punch_type = [string]$rs.Fields.Item("CHECKTYPE").Value
      device_id = [int]$rs.Fields.Item("SENSORID").Value
      device_sn = [string]$rs.Fields.Item("sn").Value
    })
    $rs.MoveNext()
  }
  $conn.Close()
  return $result | ConvertTo-Json -Compress -Depth 5
} catch {
  return "{""error"": """ + $_.Exception.Message.Replace("""","'") + """}"
} finally {
  if ($conn.State -eq 1) { $conn.Close() }
}
`, filePath, dateFilter)

	cmd := exec.Command("powershell", "-NoProfile", "-Command", psScript)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to run PowerShell: %w", err)
	}

	outStr := strings.TrimSpace(string(output))

	var errResult map[string]string
	if err := json.Unmarshal([]byte(outStr), &errResult); err == nil {
		if msg, ok := errResult["error"]; ok {
			return nil, fmt.Errorf("MDB read error: %s", msg)
		}
	}

	var records []ZKPunchRecord
	if err := json.Unmarshal([]byte(outStr), &records); err != nil {
		return nil, fmt.Errorf("failed to parse MDB data: %w", err)
	}

	return records, nil
}
