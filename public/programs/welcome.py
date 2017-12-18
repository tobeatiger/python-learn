print '\n欢迎来学习 Python!\n'
s = raw_input('Say something: ')
if s == '':
  s = 'ABC'

for i in s:
  print '\n== ' + i + ' =='
  for j in 'Python':
    print i + '  :  ' + j
  print '== ' + i + ' =='

print '\nYeah! This is your first program!\n'
print '你也可以直接在这儿写 Python 命令哦！\n'