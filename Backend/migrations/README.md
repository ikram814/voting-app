# Database Migrations

## Add Image Column to Polls Table

To add the `image` column to the `polls` table, run the following SQL command:

```sql
ALTER TABLE `polls` 
ADD COLUMN `image` LONGTEXT DEFAULT NULL AFTER `question`;
```

Or execute the migration file:

```bash
mysql -u your_username -p vote_app < add_image_to_polls.sql
```

This will allow polls to have an optional image that can be uploaded when creating a poll.





