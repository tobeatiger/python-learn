print '\n欢迎来学习 Python!\n'
str = raw_input('Say something: ')
if str == '':
  str = 'ABC'

for i in str:
  print '\n== ' + i + ' =='
  for j in 'Python':
    print i + '  :  ' + j
  print '== ' + i + ' =='

print '\nYeah! This is your first program!\n'
print '你也可以直接在这儿写 Python 命令哦！\n'