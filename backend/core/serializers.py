from django.contrib.contenttypes import fields
from rest_framework import serializers
from generic_relations.relations import GenericRelatedField
from graphql_relay.node.node import from_global_id

from core import models 

class ModSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Mod
		fields = ("id", "state", "date", "reason", "parent", "group_id", "history", "user")

	id = serializers.CharField(required=False)

	# CharField cause it'll be passed down from Relay as a GlobalID
	parent = serializers.CharField(required=False)		

	def validate_parent(self, value):
		"Get the Mod.parent instance from Relay GlobalID"

		django_id = from_global_id(value)[1]
		try: 
			mod = models.Mod.objects.get(id=django_id)
		except:
			raise serializers.ValidationError("'Mod' instance doesn't exist.")
		return mod

	def create(self, validated_data):
		
		# Since the user field's validation depends upon another field that needs to
		# be validated, the logic is preferred to be here.
		parent = validated_data.get("parent", None)
		user = validated_data["user"]
		if parent:
			if parent.user != user:
				raise serializers.ValidationError("Not authorized!")

		mod = models.Mod.objects.create(
			**validated_data
		)

		return mod



class AttachmentSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Attachment
		fields = ("id", "url", "title", "attm_type", "user", "content_type", "content_object")

	id = serializers.CharField(required=False) 
	content_type = serializers.CharField()
	content_object = serializers.CharField()

	def create(self, validated_data):
		contents = {
			"lecture": models.Lecture,
			"question": models.Question,
			"answer": models.Answer,
			"quiz": models.Quiz,
			"resource": models.Resource,
			"summary": models.Summary 
		}
		try:
			content = contents[validated_data.pop("content_type")].objects.get(
				id=validated_data.pop("content_object")
			)
		
		except: 
			raise Exception("Error getting 'Content'.")
		
		attachment = models.Attachment.objects.create(
			content_object=content,
			**validated_data
		)
		return attachment

class NestedAttachmentSerializer(serializers.Serializer):
	id = serializers.IntegerField(read_only=True)
	title = serializers.CharField()
	url = serializers.URLField()
	attm_type = serializers.ChoiceField(choices=models.Attachment.ATTM_TYPE.choices, default=models.Attachment.ATTM_TYPE.IMAGE)

class LectureSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Lecture
		fields = ("id", "title", "lecture_type", "body", "user", "tag_set", "mod", "course")

	# GraphQL's ID is a string.
	# It's important to make required=False so mutations can user
	#serializers to create instanced, too.
	id = serializers.CharField(required=False) 
	tag_set = serializers.ListField(
		child=serializers.CharField(),
		required=False
	)
	mod = serializers.PrimaryKeyRelatedField(queryset=models.Mod.objects.all(), required=False)

	def create(self, validated_data):
		tag_set = validated_data.pop("tag_set", [])
		mod = models.Mod.create_child_mod(validated_data.pop("mod", None))
		lecture = models.Lecture.objects.create(mod=mod, **validated_data)
		for tag in tag_set:
			try:
				tag = models.Tag.objects.get(id=tag)
			except:
				raise Exception("error")
			tag.contents.add(lecture)
		return lecture

class QuestionSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Question
		fields = ("id", "title", "body", "user", "tag_set", "mod", "course")
	
	course = serializers.CharField(required=True)
	id = serializers.CharField(required=False) 
	tag_set = serializers.ListField(
		child=serializers.CharField(),
		required=False
	)
	mod = serializers.CharField(required=False)

	def validate_course(self, value):
		try:
			course = models.Course.objects.get(code=value)
		except models.Course.DoesNotExist:
			raise serializers.ValidationError("Course dosen't exist.")

		return course

	def create(self, validated_data):
		tag_set = validated_data.pop("tag_set", [])
		user = validated_data["user"]
		
		# This extra step is for https://github.com/encode/django-rest-framework/issues/2203
		# allow_blank=True didn't solve it.
		mod_serializer_data = {
			"user": user.id
		} 
		parent = validated_data.pop("mod", None)
		if parent:
			mod_serializer_data["parent"] = parent
		mod_serializer = ModSerializer(data=mod_serializer_data)

		if mod_serializer.is_valid():
			mod = mod_serializer.save()
			question = models.Question.objects.create(mod=mod, **validated_data)
			for tag in tag_set:
				try:
					tag = models.Tag.objects.get(title=tag, course=validated_data["course"])
				except models.Tag.DoesNotExist:
					tag_mod_serializer = ModSerializer(data={
						"user": user.id
					})
					if tag_mod_serializer.is_valid():
						tag_mod = tag_mod_serializer.save()
						tag = models.Tag.objects.create(
							title=tag,
							body="",
							course=validated_data["course"],
							user=user,
							mod=tag_mod,
							tag_type=models.Tag.TAG_TYPE.CONCEPT
						)
					else:
						raise Exception("'Tag' Not valid.")
				tag.contents.add(question)
		else:
			raise Exception("'Mod' Not valid.")
		return question

class AnswerSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Answer
		fields = ("id", "question", "body", "user", "tag_set", "mod", "course")

	id = serializers.CharField(required=False) 
	tag_set = serializers.ListField(
		child=serializers.CharField(),
		required=False
	)
	mod = serializers.CharField(required=False)
	question = serializers.CharField(required=True)
	course = serializers.CharField(required=True)

	def validate_course(self, value):
		try:
			course = models.Course.objects.get(code=value)
		except models.Course.DoesNotExist:
			raise serializers.ValidationError("Course dosen't exist.")

		return course

	def validate_question(self, value):
		"Get the Question instance from Relay GlobalID"
		
		django_id = from_global_id(value)[1]
		try: 
			question = models.Question.objects.get(id=django_id)
		except:
			raise serializers.ValidationError("'Question' instance doesn't exist.")
		return question

	def create(self, validated_data):
		tag_set = validated_data.pop("tag_set", [])
		user = validated_data["user"]
		
		# This extra step is for https://github.com/encode/django-rest-framework/issues/2203
		# allow_blank=True didn't solve it.
		mod_serializer_data = {
			"user": user.id
		} 
		parent = validated_data.pop("mod", None)
		if parent:
			mod_serializer_data["parent"] = parent
		mod_serializer = ModSerializer(data=mod_serializer_data)

		if mod_serializer.is_valid():
			mod = mod_serializer.save()
			answer = models.Answer.objects.create(mod=mod, **validated_data)
			for tag in tag_set:
				try:
					tag = models.Tag.objects.get(title=tag, course=validated_data["course"])
				except models.Tag.DoesNotExist:
					tag_mod_serializer = ModSerializer(data={
						"user": user.id
					})
					if tag_mod_serializer.is_valid():
						tag_mod = tag_mod_serializer.save()
						tag = models.Tag.objects.create(
							title=tag,
							body="",
							course=validated_data["course"],
							user=user,
							mod=tag_mod,
							tag_type=models.Tag.TAG_TYPE.CONCEPT
						)
					else:
						raise Exception("'Tag' Not valid.")
				tag.contents.add(answer)
		else:
			raise Exception("'Mod' Not valid.")
		return answer

class QuizSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Quiz
		fields = ("id", "title", "a", "b", "c", "d", "answer", "user", "tag_set", "mod", "course")
	
	course = serializers.CharField(required=True)
	id = serializers.CharField(required=False) 
	tag_set = serializers.ListField(
		child=serializers.CharField(),
		required=False
	)
	mod = serializers.CharField(required=False)

	def validate_course(self, value):
		try:
			course = models.Course.objects.get(code=value)
		except models.Course.DoesNotExist:
			raise serializers.ValidationError("Course dosen't exist.")

		return course

	def create(self, validated_data):
		tag_set = validated_data.pop("tag_set", [])
		user = validated_data["user"]

		# This extra step is for https://github.com/encode/django-rest-framework/issues/2203
		# allow_blank=True didn't solve it.
		mod_serializer_data = {
			"user": user.id
		} 
		parent = validated_data.pop("mod", None)
		if parent:
			mod_serializer_data["parent"] = parent
		mod_serializer = ModSerializer(data=mod_serializer_data)

		if mod_serializer.is_valid():
			mod = mod_serializer.save()
			quiz = models.Quiz.objects.create(mod=mod, **validated_data)
			for tag in tag_set:
				try:
					tag = models.Tag.objects.get(title=tag, course=validated_data["course"])
				except models.Tag.DoesNotExist:
					tag_mod_serializer = ModSerializer(data={
						"user": user.id
					})
					if tag_mod_serializer.is_valid():
						tag_mod = tag_mod_serializer.save()
						tag = models.Tag.objects.create(
							title=tag,
							body="",
							course=validated_data["course"],
							user=user,
							mod=tag_mod,
							tag_type=models.Tag.TAG_TYPE.CONCEPT
						)
					else:
						raise Exception("'Tag' Not valid.")
				tag.contents.add(quiz)
		else:
			raise Exception("'Mod' Not valid.")

		# Create a correct solution for quiz creator
		solution = models.Solution.objects.create(
			user=user,
			quiz=quiz,
			correct=True,
			answer=quiz.answer
		)

		return quiz

class SolutionSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Solution
		fields = ("id", "quiz", "user", "answer", "correct")

	id = serializers.CharField(required=False)
	quiz = serializers.CharField(required=True)

	def validate_quiz(self, value):
		django_id = from_global_id(value)[1]
		try: 
			quiz = models.Quiz.objects.get(id=django_id)
		except:
			raise serializers.ValidationError("'Quiz' instance doesn't exist.")
		return quiz

	def create(self, validated_data):
		# Check of correct
		validated_data['correct'] = validated_data.get('answer', None) == validated_data['quiz'].answer

		solution = models.Solution.objects.create(**validated_data)
		return solution

class ResourceSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Resource
		fields = ("id", "title", "body", "user", "tag_set", "mod", "course", "attachment_set")

	course = serializers.CharField(required=True)
	id = serializers.CharField(required=False) 
	tag_set = serializers.ListField(
		child=serializers.CharField(),
		required=False
	)
	attachment_set = NestedAttachmentSerializer(many=True, required=False)	# Used for nested attachment creation (just the needed fields)
	mod = serializers.CharField(required=False)

	def validate_course(self, value):
		try:
			course = models.Course.objects.get(code=value)
		except models.Course.DoesNotExist:
			raise serializers.ValidationError("Course dosen't exist.")

		return course

	def create(self, validated_data):
		# attachment_set = validated_data.pop("attachment_set", [])
		tag_set = validated_data.pop("tag_set", [])
		user = validated_data["user"]

		# This extra step is for https://github.com/encode/django-rest-framework/issues/2203
		# allow_blank=True didn't solve it.
		mod_serializer_data = {
			"user": user.id
		} 
		parent = validated_data.pop("mod", None)
		if parent:
			mod_serializer_data["parent"] = parent
		mod_serializer = ModSerializer(data=mod_serializer_data)
		if mod_serializer.is_valid():
			mod = mod_serializer.save()
			resource = models.Resource.objects.create(mod=mod, **validated_data)

			for tag in tag_set:
				try:
					tag = models.Tag.objects.get(title=tag, course=validated_data["course"])
				except models.Tag.DoesNotExist:
					tag_mod_serializer = ModSerializer(data={
						"user": user.id
					})
					if tag_mod_serializer.is_valid():
						tag_mod = tag_mod_serializer.save()
						tag = models.Tag.objects.create(
							title=tag,
							body="",
							course=validated_data["course"],
							user=user,
							mod=tag_mod,
							tag_type=models.Tag.TAG_TYPE.CONCEPT
						)
					else:
						raise Exception("'Tag' Not valid.")
				tag.contents.add(resource)
		else:
			raise Exception("'Mod' Not valid.")
		return resource

class SummarySerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Summary
		fields = ("id", "title", "body", "user", "tag_set", "mod", "course")

	course = serializers.CharField(required=True)
	id = serializers.CharField(required=False) 
	tag_set = serializers.ListField(
		child=serializers.CharField(),
		required=False
	)
	mod = serializers.CharField(required=False)

	def validate_course(self, value):
		try:
			course = models.Course.objects.get(code=value)
		except models.Course.DoesNotExist:
			raise serializers.ValidationError("Course dosen't exist.")

		return course

	def create(self, validated_data):
		tag_set = validated_data.pop("tag_set", [])
		user = validated_data["user"]
		
		# This extra step is for https://github.com/encode/django-rest-framework/issues/2203
		# allow_blank=True didn't solve it.
		mod_serializer_data = {
			"user": user.id
		} 
		parent = validated_data.pop("mod", None)
		if parent:
			mod_serializer_data["parent"] = parent
		mod_serializer = ModSerializer(data=mod_serializer_data)

		if mod_serializer.is_valid():
			mod = mod_serializer.save()
			summary = models.Summary.objects.create(mod=mod, **validated_data)
			for tag in tag_set:
				try:
					tag = models.Tag.objects.get(title=tag, course=validated_data["course"])
				except models.Tag.DoesNotExist:
					tag_mod_serializer = ModSerializer(data={
						"user": user.id
					})
					if tag_mod_serializer.is_valid():
						tag_mod = tag_mod_serializer.save()
						tag = models.Tag.objects.create(
							title=tag,
							body="",
							course=validated_data["course"],
							user=user,
							mod=tag_mod,
							tag_type=models.Tag.TAG_TYPE.CONCEPT
						)
					else:
						raise Exception("'Tag' Not valid.")
				tag.contents.add(summary)
		else:
			raise Exception("'Mod' Not valid.")
		return summary

class VoteSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Vote
		fields = ("id", "value", "content_id", "user")

	id = serializers.CharField(required=False) 
	content_id = serializers.CharField(required=True)

	def validate_content_id(self, value):
		model_mapping = {
			"LectureType": models.Lecture,
			"SummaryType": models.Summary,
			"ResourceType": models.Resource,
			"QuestionType": models.Question,
			"AnswerType": models.Answer,
			"QuizType": models.Quiz
		}
		
		content_type, content_id = from_global_id(value)
		content_model = model_mapping[content_type] if model_mapping.get(content_type) else None
		if content_model:
			content = content_model.objects.get(id=content_id)
			return content
		
		return None

	def create(self, validated_data):
		vote = models.Vote.objects.create(
			value=validated_data["value"],
			user=validated_data["user"],
			content_object=validated_data["content_id"]
		)
		return vote

