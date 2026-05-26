from django.core.exceptions import ValidationError
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from kyc.models import KYCSubmission
from kyc.serializers import KYCSubmissionSerializer
from kyc.permissions import IsReviewer

class MerchantKYCViewSet(mixins.CreateModelMixin,
                         mixins.RetrieveModelMixin,
                         mixins.UpdateModelMixin,
                         mixins.ListModelMixin,
                         viewsets.GenericViewSet):
    serializer_class = KYCSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KYCSubmission.objects.filter(merchant=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(merchant=self.request.user)

    @action(detail=True, methods=['post'])
    def submit_application(self, request, pk=None):
        submission = self.get_object()
        try:
            submission.transition_state('submitted')
            return Response(
                {"message": "Successfully submitted for review."},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e.message) if hasattr(e, 'message') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ReviewerQueueViewSet(mixins.ListModelMixin,
                           mixins.RetrieveModelMixin,
                           viewsets.GenericViewSet):
    serializer_class = KYCSubmissionSerializer
    permission_classes = [IsAuthenticated, IsReviewer]

    def get_queryset(self):
        from django.db.models import Max
        latest_ids = KYCSubmission.objects.values('merchant').annotate(latest_id=Max('id')).values_list('latest_id', flat=True)
        return KYCSubmission.objects.filter(
            id__in=latest_ids,
            status__in=['submitted', 'under_review', 'more_info_requested']
        ).order_by('created_at')

    @action(detail=True, methods=['post'])
    def change_state(self, request, pk=None):
        submission = self.get_object()
        new_state = request.data.get('new_state')

        if not new_state:
            return Response(
                {"error": "Missing 'new_state' in payload."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            submission.transition_state(new_state)
            return Response(
                {"message": f"Successfully transitioned to {new_state}"},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e.message) if hasattr(e, 'message') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
