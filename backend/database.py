import sqlite3

conn = sqlite3.connect("files.db")

myCursor = conn.cursor()

#myCursor.execute("""CREATE TABLE files (
#                 name text, 
#                 date integer
#                 )""")


#myCursor.execute("""INSERT INTO files VALUES ("DSC_1993933.jpg",19222025) """)

myCursor.execute("SELECT * FROM files WHERE name='DSC_1993933.jpg'")

print(myCursor.fetchall())


conn.commit()

conn.close()