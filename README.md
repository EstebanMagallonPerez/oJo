# React2
 ```html
<!--HTML example template-->
<div class="panel panel-default">
    <div class="panel-heading">
        <div class="panel-title">{{headerContent}}</div>
    </div>
    <div class="panel-body">
        {{bodyContent}}
    </div>
    <div class="panel-footer">{{footerContent}}</div>
</div>
<!--this script runs each time the template loads-->
<script>
    console.log("Script loading works")
</script>
<!--This is all the custom css for the template. it will be compiled into a shared css file-->
<style>
    .panel-title {
        background-color: red
    }
</style>
```
