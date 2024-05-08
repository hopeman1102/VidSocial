How to start project
1. activate local environment using command - source /home/user/Documents/vid_socail_new/vid_social_api/myenv/bin/activate

2. run project - python manage.py runserver 0.0.0.0:8000

3. start celery using command : 
    celery - start
    celery -A vidsocial.celery worker --pool=solo -l info

4. start reddis server using command : 
   sudo service redis-server start
   redis-cli ping
   sudo systemctl status redis
   sudo service redis restart  

5. start mysql server using command :
   sudo service apache2 stop
   sudo /opt/lampp/lampp stop
   sudo /opt/lampp/lampp start
   
   
   
#today work list.

--> Vid social work

1) Apply 24 hour coin deduction and 72 hour coin deduction condition when call happen  : done 
2) Show the list of recipt of selected worker payment detail . : done
3) Modify list api's set all latest data on Top. : done
4) Modify report api .  : done
5) Modify admin-sponser payment history api : done 
4) Create html format for mail  where mail is sending . 
5) Change mail template and content  from  static  to dynamic template for all mail.
