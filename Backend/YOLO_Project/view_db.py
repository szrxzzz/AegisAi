import sqlite3

try:
    # Connect to the SQLite database
    conn = sqlite3.connect('energy_data.db')
    cursor = conn.cursor()
    
    # Query all records
    cursor.execute("SELECT * FROM energy_logs")
    rows = cursor.fetchall()
    
    if not rows:
        print("The database is currently empty.")
        print("Make sure 'server.py' is running, and 'main.py' logs someone leaving a quadrant!")
    else:
        print(f"\n--- ENERGY DATABASE ({len(rows)} records) ---\n")
        print(f"{'ID':<5} | {'Timestamp':<25} | {'Room':<8} | {'Quadrant':<10} | {'Event':<6} | {'Duration (s)':<14} | {'Energy (kWh)':<15}")
        print("-" * 100)
        
        for r in rows:
            # Format numbers to look clean; if None (like an ON event), leave it blank
            dur = f"{r[5]:.2f}" if r[5] is not None else ""
            nrg = f"{r[6]:.6f}" if r[6] is not None else ""
            
            print(f"{r[0]:<5} | {str(r[1]):<25} | {str(r[2]):<8} | {str(r[3]):<10} | {str(r[4]):<6} | {dur:<14} | {nrg:<15}")

except Exception as e:
    print(f"Error reading database: {e}")
finally:
    if 'conn' in locals():
        conn.close()
